import { NextResponse } from 'next/server';
import { createPublicClient, http, decodeEventLog } from 'viem';
import { mainnet, arbitrum, optimism, base, polygon } from 'viem/chains';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase() || '0x0000000000000000000000000000000000000000';

// Unified Dictionary of exact legitimately-issued USDT/USDC smart contracts per chain mapping
// CRITICAL SECURITY: If an attacker sends a counterfeit token with the same ticker, the contract ID will miss this dictionary.
const CONTRACT_ADDRESSES: Record<string, { USDT: string | null, USDC: string }> = {
    'ethereum': {
        USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    },
    'arbitrum': {
        USDT: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
    },
    'optimism': {
        USDT: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        USDC: '0x0b2c639c533813f4aa9d7837caf62653d097ff85'
    },
    'base': {
        USDT: null, // Base network currently does not have a native Tether fiat-backed deployment
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    },
    'polygon': {
        USDT: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        USDC: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'
    }
};

const CHAIN_PROVIDERS: Record<string, { chain: any, rpc: string }> = {
    'ethereum': { chain: mainnet, rpc: 'https://cloudflare-eth.com' },
    'arbitrum': { chain: arbitrum, rpc: 'https://arb1.arbitrum.io/rpc' },
    'optimism': { chain: optimism, rpc: 'https://mainnet.optimism.io' },
    'base': { chain: base, rpc: 'https://mainnet.base.org' },
    'polygon': { chain: polygon, rpc: 'https://polygon-rpc.com' }
};

const transferAbi = [
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    }
] as const;

export async function POST(req: Request) {
    try {
        // Authenticate the user from the token, preventing impersonation spoofing
        const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.sub) {
            return NextResponse.json({ message: "Unauthorized Request" }, { status: 401 });
        }

        const userId = token.sub;
        const body = await req.json();
        const { txHash, currency, amount, network } = body;
        const targetNetwork = network || 'ethereum';

        if (!txHash || !currency) {
            return NextResponse.json({ message: 'Missing transaction hash or currency' }, { status: 400 });
        }

        if (currency !== 'USDT' && currency !== 'USDC') {
            return NextResponse.json({ message: 'Unsupported currency' }, { status: 400 });
        }

        if (!CHAIN_PROVIDERS[targetNetwork]) {
            return NextResponse.json({ message: 'Unsupported blockchain network' }, { status: 400 });
        }

        const expectedContract = CONTRACT_ADDRESSES[targetNetwork][currency as 'USDT' | 'USDC'];
        
        if (!expectedContract) {
            return NextResponse.json({ message: `${currency} is not natively supported on the ${targetNetwork} network.` }, { status: 400 });
        }

        const publicClient = createPublicClient({
            chain: CHAIN_PROVIDERS[targetNetwork].chain,
            transport: http(CHAIN_PROVIDERS[targetNetwork].rpc)
        });

        const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

        if (!receipt || receipt.status !== 'success') {
            return NextResponse.json({ message: 'Transaction failed or not found on-chain' }, { status: 400 });
        }

        const decimals = currency === 'USDT' && targetNetwork === 'ethereum' ? 6 : 6; // Both are practically 6 decimals everywhere except some weird Poly bridge instances, but native usdc/usdt is 6
        
        let matchedAmount = BigInt(0);

        for (const log of receipt.logs) {
            if (log.address.toLowerCase() !== expectedContract.toLowerCase()) continue;

            try {
                const decoded = decodeEventLog({
                    abi: transferAbi,
                    data: log.data,
                    topics: log.topics,
                });

                if (
                    decoded.eventName === 'Transfer' &&
                    // @ts-ignore
                    decoded.args.to?.toLowerCase() === ADMIN_WALLET.toLowerCase()
                ) {
                    // @ts-ignore
                    matchedAmount += BigInt(decoded.args.value || 0);
                }
            } catch (e) {
                // Ignore logs that don't match the Transfer abi
            }
        }

        if (matchedAmount === BigInt(0)) {
            return NextResponse.json({ message: 'No matching transfer to Admin wallet found' }, { status: 400 });
        }

        const floatAmount = Number(matchedAmount) / (10 ** decimals);

        // Security Check: Make sure transaction hasn't been processed
        const existingLedger = await prisma.ledger.findFirst({
            where: { description: { contains: txHash } }
        });

        if (existingLedger) {
            return NextResponse.json({ message: 'Transaction already processed' }, { status: 400 });
        }

        // Check if amount roughly aligns
        if (amount && floatAmount < Number(amount) - 0.05) {
            return NextResponse.json({ message: `Insufficient transfer amount. Expected ${amount}, verified ${floatAmount}` }, { status: 400 });
        }

        // Execute changes atomically
        await prisma.$transaction(async (tx) => {
            if (currency === 'USDT') {
                await tx.user.update({
                    where: { id: userId },
                    data: { usdtBalance: { increment: floatAmount } },
                });
            } else {
                await tx.user.update({
                    where: { id: userId },
                    data: { usdcBalance: { increment: floatAmount } },
                });
            }

            await tx.ledger.create({
                data: {
                    userId,
                    type: 'DEPOSIT',
                    amount: floatAmount,
                    currency,
                    description: `Web3 Deposit: ${txHash} - ${JSON.stringify({ txHash, method: 'web3', network: targetNetwork, verifiedAt: new Date().toISOString() })}`
                }
            });
        });

        return NextResponse.json({ message: 'Deposit verified and credited', amount: floatAmount }, { status: 200 });

    } catch (error: any) {
        console.error('Web3 Verification Error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
