'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, Copy, ExternalLink, Wallet, CreditCard, Loader2, ChevronRight, RefreshCw } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseUnits } from 'viem';
import { mainnet, arbitrum, optimism, base, polygon } from 'wagmi/chains';
import dynamic from 'next/dynamic';

const ClientWeb3Provider = dynamic(
    () => import('@/app/providers/Web3Provider').then(mod => mod.Web3Provider),
    { ssr: false }
);

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '0x0000000000000000000000000000000000000000';

const NETWORK_CHAINS: Record<string, number> = {
    'ethereum': mainnet.id,
    'arbitrum': arbitrum.id,
    'optimism': optimism.id,
    'base': base.id,
    'polygon': polygon.id
};

const CONTRACT_ADDRESSES: Record<string, { USDT: string | null, USDC: string }> = {
    'ethereum': { USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7', USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
    'arbitrum': { USDT: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
    'optimism': { USDT: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', USDC: '0x0b2c639c533813f4aa9d7837caf62653d097ff85' },
    'base': { USDT: null, USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    'polygon': { USDT: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', USDC: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359' }
};

const erc20Abi = [
    {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
    }
] as const;
import { Stripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';

export default function DepositPage() {
    return (
        <ClientWeb3Provider>
            <DepositContent />
        </ClientWeb3Provider>
    );
}

function DepositContent() {
    const { data: session } = useSession();
    const [currency, setCurrency] = useState<'USDT' | 'USDC'>('USDT');
    const [method, setMethod] = useState<'web3' | 'card'>('web3');
    const [network, setNetwork] = useState<'ethereum' | 'arbitrum' | 'optimism' | 'base' | 'polygon'>('ethereum');
    const [saveCard, setSaveCard] = useState(false);
    const [amount, setAmount] = useState<string>('100');
    const [success, setSuccess] = useState<boolean>(false);

    // Web3 Wagmi Hooks
    const { address, isConnected, chainId } = useAccount();
    const { switchChain } = useSwitchChain();
    const { data: web3TxHash, writeContractAsync, isPending: isWalletPromptOpen } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: web3TxHash });

    useEffect(() => {
        if (isConfirmed && web3TxHash) {
            handleVerifyWeb3(web3TxHash);
        }
    }, [isConfirmed, web3TxHash]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stripe State
    const [clientSecret, setClientSecret] = useState('');
    const [grossAmount, setGrossAmount] = useState(0);
    // const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null); // Removed as it's now a global constant

    const userId = (session?.user as any)?.id;

    useEffect(() => {
        // const fetchStripeKey = async () => { // Removed as stripePromise is now a global constant
        //     try {
        //         // Fetch dynamic Stripe key from Admin Config
        //         const pubKey = await getStripePublishableKey();
        //         if (pubKey) {
        //             setStripePromise(loadStripe(pubKey));
        //         }
        //     } catch (err) {
        //         console.error("Failed to load Stripe key");
        //     }
        // };
        // fetchStripeKey();
    }, []);

    // Provide a dummy web3 wallet address for demonstration
    // const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '0xYourAdminWalletAddress...'; // Removed as it's now a global constant

    // AutoAlpha Absorbs Stripe Fee
    const calculateTotalWithFee = (baseAmount: number) => {
        if (baseAmount <= 0) return 0;
        return baseAmount; // No extra fees charged to end user
    };

    const numAmount = parseFloat(amount) || 0;
    const totalCharge = numAmount;
    const feeAmount = 0; // We absorb it

    const handleVerifyWeb3 = async (hashToVerify: string) => {
        if (!hashToVerify) {
            setError("Missing transaction hash from wallet.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const numAmount = parseFloat(amount || '0');
            const res = await fetch("/api/payments/verify-web3", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ txHash: hashToVerify, currency, amount: numAmount, network })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to verify transaction. It may be pending or invalid.");
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWeb3Pay = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }
        
        setError(null);
        
        const targetChainId = NETWORK_CHAINS[network];
        if (chainId !== targetChainId) {
            try {
                switchChain({ chainId: targetChainId });
                return; // Wait for them to switch
            } catch (e: any) {
                setError("Failed to switch network in wallet. Please switch manually.");
                return;
            }
        }

        const tokenAddress = CONTRACT_ADDRESSES[network]?.[currency as 'USDT' | 'USDC'];
        if (!tokenAddress) {
            setError(`${currency} is not natively supported on ${network}. Please switch to USDC or use a different network.`);
            return;
        }

        try {
            const parsedAmount = parseUnits(amount, 6); // USDT/USDC generally use 6 decimals
            
            await writeContractAsync({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [ADMIN_WALLET as `0x${string}`, parsedAmount],
            });
        } catch (e: any) {
            setError(e.shortMessage || e.message || "Transaction failed or rejected by wallet.");
        }
    };

    const handleStripeCheckout = async () => {
        if (numAmount < 10) {
            setError("Minimum deposit via card is $10.");
            return;
        }

        if (!userId) {
            setError("Session authentication missing. Please refresh.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const res = await fetch('/api/payments/card-intent', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, desiredAmount: numAmount, currency, saveCard })
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to initialize secure checkout engine.");
            }

            const data = await res.json();
            setClientSecret(data.clientSecret);
            setGrossAmount(data.grossAmount);

        } catch (err: any) {
            setError(err.message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Fund Account</h1>
                <p className="text-foreground/60 text-lg">Add capital to your AutoAlpha portfolio to begin automated trading.</p>
            </div>

            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 -mt-12 -mr-12 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 dark:from-cyan-400/5 dark:to-purple-600/5 blur-3xl rounded-full w-64 h-64 pointer-events-none" />
                
                {/* Amount Input */}
                <div className="space-y-3 relative z-10">
                    <label className="text-sm font-medium text-foreground/80">Deposit Amount</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-6 text-3xl font-bold text-foreground/40">$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1.5rem] pl-14 pr-28 py-6 text-4xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner transition-all"
                            placeholder="0.00"
                        />
                        {method === 'web3' ? (
                            <div className="absolute right-3 flex bg-black/5 dark:bg-white/5 rounded-xl p-1 border border-black/5 dark:border-white/5">
                                <button
                                    onClick={() => setCurrency('USDT')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currency === 'USDT' ? 'bg-gradient-to-br from-cyan-400 to-purple-600 text-white shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                                >
                                    USDT
                                </button>
                                <button
                                    onClick={() => setCurrency('USDC')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currency === 'USDC' ? 'bg-gradient-to-br from-cyan-400 to-purple-600 text-white shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                                >
                                    USDC
                                </button>
                            </div>
                        ) : (
                            <div className="absolute right-3 flex items-center pr-4">
                                <span className="text-sm font-bold text-foreground/40 uppercase tracking-widest">USD</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4 relative z-10">
                    <label className="text-sm font-medium text-foreground/80">Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setMethod('web3')}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[1.5rem] border transition-all ${method === 'web3' ? 'border-transparent bg-gradient-to-br from-cyan-400/20 to-purple-600/20 shadow-inner' : 'border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <Wallet className={`w-8 h-8 ${method === 'web3' ? 'text-purple-500 dark:text-purple-400' : 'text-foreground/60'}`} />
                            <span className={`text-base font-bold ${method === 'web3' ? 'text-purple-600 dark:text-purple-400' : 'text-foreground/80'}`}>Web3 Wallet</span>
                        </button>
                        <button
                            onClick={() => setMethod('card')}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[1.5rem] border transition-all ${method === 'card' ? 'border-transparent bg-gradient-to-br from-cyan-400/20 to-purple-600/20 shadow-inner' : 'border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <CreditCard className={`w-8 h-8 ${method === 'card' ? 'text-purple-500 dark:text-purple-400' : 'text-foreground/60'}`} />
                            <span className={`text-base font-bold ${method === 'card' ? 'text-purple-600 dark:text-purple-400' : 'text-foreground/80'}`}>Credit/Debit</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 relative z-10">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                    </div>
                )}

                {/* Method Specific UI */}
                {method === 'web3' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 relative z-10">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground/80">Select Blockchain Network</label>
                            <select 
                                value={network}
                                title="Select Blockchain Network"
                                aria-label="Select Blockchain Network"
                                onChange={(e) => setNetwork(e.target.value as any)}
                                className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner cursor-pointer"
                            >
                                <option value="ethereum">Ethereum (ERC-20)</option>
                                <option value="arbitrum">Arbitrum One</option>
                                <option value="optimism">Optimism (OP Mainnet)</option>
                                <option value="base">Base</option>
                                <option value="polygon">Polygon (MATIC)</option>
                            </select>
                        </div>

                        <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 space-y-3">
                            <p className="text-xs text-foreground/60 font-bold uppercase tracking-wider">Deposit Address</p>
                            <p className="font-mono text-base break-all text-foreground select-all bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5 shadow-inner">{ADMIN_WALLET}</p>
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
                                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-red-500 uppercase tracking-wide">Critical Warning</p>
                                    <p className="text-sm text-red-500/90 leading-relaxed font-medium">
                                        Send <span className="font-black underline mx-1">exactly {numAmount || '0.00'} {currency}</span> to this address EXCLUSIVELY via the <span className="font-bold underline uppercase">{network}</span> network. Sending via the wrong chain WILL result in permanent loss of funds.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Removed Transaction Hash input */}
                        {/* <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground/80">Transaction Hash</label>
                            <input
                                type="text"
                                value={txHash}
                                onChange={(e) => setTxHash(e.target.value)}
                                className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-base text-foreground placeholder:text-foreground/40 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                placeholder="0x..."
                            />
                        </div> */}

                        <div className="flex items-start gap-3 mt-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                            <AlertCircle className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                                By proceeding, you agree to our <a href="/terms" target="_blank" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Gas Policy</a>. Deposited funds are prepaid performance fees and are strictly non-refundable once your first trade is executed.
                            </p>
                        </div>

                        {/* Web3 Button Overrides & UI */}
                        <div className="flex flex-col gap-4 mt-6">
                            {!isConnected ? (
                                <div className="w-full flex justify-center py-2">
                                    {/* @ts-ignore - Custom Web3Modal Web Component */}
                                    <w3m-button />
                                </div>
                            ) : chainId !== NETWORK_CHAINS[network] ? (
                                <button
                                    onClick={() => switchChain({ chainId: NETWORK_CHAINS[network] })}
                                    className="w-full py-5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white rounded-[1.5rem] text-xl font-bold transition-all shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98]"
                                >
                                    Switch Network to {network.charAt(0).toUpperCase() + network.slice(1)}
                                </button>
                            ) : (
                                <button
                                    onClick={handleWeb3Pay}
                                    disabled={isWalletPromptOpen || isConfirming || isProcessing}
                                    className="w-full py-5 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white rounded-[1.5rem] text-xl font-bold transition-all shadow-[0_10px_40px_rgba(168,85,247,0.3)] hover:shadow-[0_10px_50px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98]"
                                >
                                    {isWalletPromptOpen ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Approve in Wallet...
                                        </>
                                    ) : isConfirming || isProcessing ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Confirming Block...
                                        </>
                                    ) : (
                                        <>
                                            Pay {amount || '0.00'} {currency} <ArrowRight className="w-6 h-6" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 relative z-10">
                        <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 space-y-4">
                            <div className="flex justify-between items-center text-base">
                                <span className="text-foreground/60 font-medium">Deposit Amount</span>
                                <span className="font-bold">${numAmount.toFixed(2)} USD</span>
                            </div>
                            <div className="flex justify-between items-center text-base">
                                <span className="text-foreground/60 font-medium">Processing Fee (Absorbed)</span>
                                <span className="font-bold text-green-500">FREE</span>
                            </div>
                            <div className="h-px bg-black/5 dark:bg-white/10 w-full my-4" />
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-foreground text-lg">Total Charge</span>
                                <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-purple-600">
                                    ${totalCharge.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-center text-foreground/40 font-medium">
                            Payments are securely processed by Stripe. AutoAlpha absorbs all processing fees.
                        </p>

                        <div className="flex items-start gap-3 mt-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                            <AlertCircle className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                                By proceeding, you agree to our <a href="/terms" target="_blank" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Gas Policy</a>. Deposited funds are prepaid performance fees and are strictly non-refundable once your first trade is executed.
                            </p>
                        </div>

                        <div className="flex items-start gap-3 mt-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={saveCard}
                                    onChange={(e) => {
                                        setSaveCard(e.target.checked);
                                        setClientSecret('');
                                        setIsProcessing(false);
                                    }}
                                    className="w-5 h-5 rounded border-black/20 dark:border-white/20 text-purple-600 focus:ring-purple-500/50 bg-white dark:bg-black/50"
                                />
                                <div className="space-y-0.5">
                                    <span className="text-sm font-bold text-foreground block">Save configuration for Auto-Refills</span>
                                    <span className="text-xs font-medium text-foreground/50 block">Requires Credit/Debit card. Unchecking this option unlocks Stripe Crypto/Stablecoin payment methods.</span>
                                </div>
                            </label>
                        </div>

                        {clientSecret && stripePromise ? (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                                <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                                    <CheckoutForm
                                        grossAmount={grossAmount}
                                        netDesiredAmount={numAmount}
                                        clientSecret={clientSecret}
                                    />
                                </Elements>
                                <button
                                    onClick={() => { setClientSecret(''); setIsProcessing(false); }}
                                    className="w-full mt-4 py-3 text-sm font-bold text-foreground/50 hover:text-foreground transition-colors"
                                >
                                    Cancel & Return
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleStripeCheckout}
                                disabled={isProcessing}
                                className="w-full py-5 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-xl shadow-purple-500/20 text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Connecting to Stripe...
                                    </>
                                ) : (
                                    <>
                                        Continue to Checkout
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
