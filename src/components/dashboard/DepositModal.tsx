'use client';

import React, { useState } from 'react';
import { Wallet, CreditCard, ChevronRight, X, AlertCircle } from 'lucide-react';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
    const [currency, setCurrency] = useState<'USDT' | 'USDC'>('USDT');
    const [method, setMethod] = useState<'web3' | 'card'>('web3');
    const [network, setNetwork] = useState<'ethereum' | 'arbitrum' | 'optimism' | 'base' | 'polygon'>('ethereum');
    const [amount, setAmount] = useState<string>('100');
    const [txHash, setTxHash] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Provide a dummy web3 wallet address for demonstration
    const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '0xYourAdminWalletAddress...';

    if (!isOpen) return null;

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

            // Success!
            alert('Deposit verified successfully!');
            onClose();

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

        setIsProcessing(true);
        setError(null);

        try {
            // Ideally, you'd fetch a Stripe Checkout Session ID from a backend route first
            // For now, we simulate the intent
            alert("Redirecting to Stripe Checkout...");
            // const res = await fetch('/api/stripe/create-checkout', ...);

        } catch (err: any) {
            setError(err.message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md max-h-[85vh] bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Fund Account</h2>
                    <button onClick={onClose} aria-label="Close" title="Close" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-foreground/60 hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Deposit Amount</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-2xl font-bold text-foreground/40">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl pl-10 pr-24 py-4 text-3xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                placeholder="0.00"
                            />
                            {/* Currency Toggle inside input */}
                            <div className="absolute right-2 flex bg-black/5 dark:bg-white/5 rounded-xl p-1 border border-black/5 dark:border-white/5">
                                <button
                                    onClick={() => setCurrency('USDT')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'USDT' ? 'bg-gradient-to-br from-cyan-400 to-purple-600 text-white shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                                >
                                    USDT
                                </button>
                                <button
                                    onClick={() => setCurrency('USDC')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'USDC' ? 'bg-gradient-to-br from-cyan-400 to-purple-600 text-white shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                                >
                                    USDC
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/80">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setMethod('web3')}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${method === 'web3' ? 'border-transparent bg-gradient-to-br from-cyan-400/20 to-purple-600/20 shadow-inner' : 'border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <Wallet className={`w-6 h-6 ${method === 'web3' ? 'text-purple-500 dark:text-purple-400' : 'text-foreground/60'}`} />
                                <span className={`text-sm font-bold ${method === 'web3' ? 'text-purple-600 dark:text-purple-400' : 'text-foreground/80'}`}>Web3 Wallet</span>
                            </button>
                            <button
                                onClick={() => setMethod('card')}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${method === 'card' ? 'border-transparent bg-gradient-to-br from-cyan-400/20 to-purple-600/20 shadow-inner' : 'border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <CreditCard className={`w-6 h-6 ${method === 'card' ? 'text-purple-500 dark:text-purple-400' : 'text-foreground/60'}`} />
                                <span className={`text-sm font-bold ${method === 'card' ? 'text-purple-600 dark:text-purple-400' : 'text-foreground/80'}`}>Credit/Debit</span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    {/* Method Specific UI */}
                    {method === 'web3' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/80">Select Blockchain Network</label>
                                <select 
                                    value={network}
                                    title="Select Blockchain Network"
                                    aria-label="Select Blockchain Network"
                                    onChange={(e) => setNetwork(e.target.value as any)}
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                >
                                    <option value="ethereum">Ethereum (ERC-20)</option>
                                    <option value="arbitrum">Arbitrum One</option>
                                    <option value="optimism">Optimism (OP Mainnet)</option>
                                    <option value="base">Base</option>
                                    <option value="polygon">Polygon (MATIC)</option>
                                </select>
                            </div>

                            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 space-y-2">
                                <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider">Deposit Address</p>
                                <p className="font-mono text-sm break-all text-foreground select-all bg-black/5 dark:bg-white/5 p-3 rounded-lg">{ADMIN_WALLET}</p>
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-red-500 uppercase tracking-wide">Critical Warning</p>
                                        <p className="text-xs text-red-500/90 leading-relaxed">
                                            Send <span className="font-black underline mx-1">exactly {numAmount || '0.00'} {currency}</span> to this address EXCLUSIVELY via the <span className="font-bold underline uppercase">{network}</span> network. Sending via the wrong chain WILL result in permanent loss of funds.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/80">Transaction Hash</label>
                                <input
                                    type="text"
                                    value={txHash}
                                    onChange={(e) => setTxHash(e.target.value)}
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                    placeholder="0x..."
                                />
                            </div>

                            <button
                                onClick={handleWeb3Submit}
                                disabled={isProcessing}
                                className="w-full py-4 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/20 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? 'Verifying...' : 'Verify Transaction'}
                                {!isProcessing && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-foreground/60">Deposit Amount</span>
                                    <span className="font-medium">${numAmount.toFixed(2)} {currency}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-foreground/60">Processing Fee (2.9% + 30¢)</span>
                                    <span className="font-medium">${feeAmount.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-black/5 dark:bg-white/10 w-full" />
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-foreground">Total Charge</span>
                                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-purple-600">
                                        ${totalCharge.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-center text-foreground/40">
                                Payments are securely processed by Stripe. Fees are passed through directly.
                            </p>

                            <button
                                onClick={handleStripeCheckout}
                                disabled={isProcessing}
                                className="w-full py-4 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/20 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? 'Connecting...' : 'Continue to Checkout'}
                                {!isProcessing && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
