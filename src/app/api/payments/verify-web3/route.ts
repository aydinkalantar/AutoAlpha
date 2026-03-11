import { NextResponse } from 'next/server';
import { createPublicClient, http, decodeEventLog } from 'viem';
import { mainnet } from 'viem/chains';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase() || '0x0000000000000000000000000000000000000000';
const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_CONTRACT?.toLowerCase() || '0xdac17f958d2ee523a2206206994597c13d831ec7';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT?.toLowerCase() || '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://cloudflare-eth.com'),
});

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
        const { txHash, currency, amount } = body;

        if (!txHash || !currency) {
            return NextResponse.json({ message: 'Missing transaction hash or currency' }, { status: 400 });
        }

        if (currency !== 'USDT' && currency !== 'USDC') {
            return NextResponse.json({ message: 'Unsupported currency' }, { status: 400 });
        }

        const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

        if (!receipt || receipt.status !== 'success') {
            return NextResponse.json({ message: 'Transaction failed or not found on-chain' }, { status: 400 });
        }

        const expectedContract = currency === 'USDT' ? USDT_ADDRESS : USDC_ADDRESS;
        const decimals = 6;

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
                    description: `Web3 Deposit: ${txHash} - ${JSON.stringify({ txHash, method: 'web3', verifiedAt: new Date().toISOString() })}`
                }
            });
        });

        return NextResponse.json({ message: 'Deposit verified and credited', amount: floatAmount }, { status: 200 });

    } catch (error: any) {
        console.error('Web3 Verification Error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
