'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { getStripePublishableKey } from '@/app/actions/stripe';
import { Stripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';

export default function DepositPage() {
    const { data: session } = useSession();
    const [currency, setCurrency] = useState<'USDT' | 'USDC'>('USDT');
    const [method, setMethod] = useState<'web3' | 'card'>('web3');
    const [network, setNetwork] = useState<'ethereum' | 'arbitrum' | 'optimism' | 'base' | 'polygon'>('ethereum');
    const [saveCard, setSaveCard] = useState(false);
    const [amount, setAmount] = useState<string>('100');
    const [txHash, setTxHash] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stripe State
    const [clientSecret, setClientSecret] = useState('');
    const [grossAmount, setGrossAmount] = useState(0);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

    const userId = (session?.user as any)?.id;

    useEffect(() => {
        const fetchStripeKey = async () => {
            try {
                // Fetch dynamic Stripe key from Admin Config
                const pubKey = await getStripePublishableKey();
                if (pubKey) {
                    setStripePromise(loadStripe(pubKey));
                }
            } catch (err) {
                console.error("Failed to load Stripe key");
            }
        };
        fetchStripeKey();
    }, []);

    // Provide a dummy web3 wallet address for demonstration
    const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '0xYourAdminWalletAddress...';

    // Calculate Stripe Fee: (Amount + 0.30) / (1 - 0.029)
    const calculateTotalWithFee = (baseAmount: number) => {
        if (baseAmount <= 0) return 0;
        return (baseAmount + 0.30) / (1 - 0.029);
    };

    const numAmount = parseFloat(amount) || 0;
    const totalCharge = method === 'card' ? calculateTotalWithFee(numAmount) : numAmount;
    const feeAmount = totalCharge - numAmount;

    const handleWeb3Submit = async () => {
        if (!txHash) {
            setError("Please provide a valid transaction hash.");
            return;
        }
        setIsProcessing(true);
        setError(null);

        try {
            const res = await fetch('/api/payments/verify-web3', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txHash, currency, amount: numAmount, network })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Verification failed.');
            }

            alert('Deposit verified successfully!');
            // Reset form or navigate away
            setTxHash('');
            setAmount('100');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
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

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground/80">Transaction Hash</label>
                            <input
                                type="text"
                                value={txHash}
                                onChange={(e) => setTxHash(e.target.value)}
                                className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-base text-foreground placeholder:text-foreground/40 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                placeholder="0x..."
                            />
                        </div>

                        <div className="flex items-start gap-3 mt-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                            <AlertCircle className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                                By proceeding, you agree to our <a href="/terms" target="_blank" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Gas Policy</a>. Deposited funds are prepaid performance fees and are strictly non-refundable once your first trade is executed.
                            </p>
                        </div>

                        <button
                            onClick={handleWeb3Submit}
                            disabled={isProcessing}
                            className="w-full py-5 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-xl shadow-purple-500/20 text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                        >
                            {isProcessing ? 'Verifying...' : 'Verify Transaction'}
                            {!isProcessing && <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 relative z-10">
                        <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 space-y-4">
                            <div className="flex justify-between items-center text-base">
                                <span className="text-foreground/60 font-medium">Deposit Amount</span>
                                <span className="font-bold">${numAmount.toFixed(2)} USD</span>
                            </div>
                            <div className="flex justify-between items-center text-base">
                                <span className="text-foreground/60 font-medium">Processing Fee (2.9% + 30¢)</span>
                                <span className="font-bold">${feeAmount.toFixed(2)}</span>
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
                            Payments are securely processed by Stripe. Fees are passed through directly.
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
