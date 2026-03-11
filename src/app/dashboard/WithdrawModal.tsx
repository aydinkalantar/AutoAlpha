"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface WithdrawModalProps {
    userId: string;
    balances: { usdtBalance: number; usdcBalance: number };
    isOpen?: boolean;
    onClose?: () => void;
}

export default function WithdrawModal({ userId, balances, isOpen = false, onClose = () => { } }: WithdrawModalProps) {
    const [mode, setMode] = useState<'CRYPTO' | 'FIAT'>('CRYPTO');
    const [currency, setCurrency] = useState<'USDT' | 'USDC'>('USDT');
    const [amountStr, setAmountStr] = useState('');
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Mock balances

    const handleClose = () => {
        onClose();
    };

    if (!isOpen) return null;

    const currentBalance = currency === 'USDT' ? balances.usdtBalance : balances.usdcBalance;

    const handleCryptoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Mock submission
            await new Promise(r => setTimeout(r, 1000));
            alert('Crypto Withdrawal Queued successfully!');
            handleClose();
        } catch (err: any) {
            alert(err.message || 'Crypto withdrawal failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFiatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Mock submission
            await new Promise(r => setTimeout(r, 1000));
            alert(`Fiat refund for $${amountStr} successfully requested!`);
            handleClose();
        } catch (err) {
            alert('Failed to request fiat refund.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-md bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Withdraw Capital</h2>
                    <button onClick={handleClose} aria-label="Close" title="Close" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-foreground/60 hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl flex border border-black/5 dark:border-white/10">
                        <button
                            onClick={() => setMode('CRYPTO')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'CRYPTO'
                                ? 'bg-gradient-to-br from-cyan-400 to-purple-600 text-white shadow-sm'
                                : 'text-foreground/60 hover:text-foreground'
                                }`}
                        >
                            Web3 Crypto
                        </button>
                        <button
                            onClick={() => setMode('FIAT')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'FIAT'
                                ? 'bg-gradient-to-br from-cyan-400 to-purple-600 text-white shadow-sm'
                                : 'text-foreground/60 hover:text-foreground'
                                }`}
                        >
                            Fiat Refund
                        </button>
                    </div>

                    {mode === 'CRYPTO' ? (
                        <form onSubmit={handleCryptoSubmit}>
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-foreground/60 px-2">Currency</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('USDT')}
                                        className={`py-4 px-4 rounded-[1.2rem] border text-sm font-semibold transition-all shadow-sm ${currency === 'USDT'
                                            ? "bg-gradient-to-br from-cyan-400 to-purple-600 border-transparent text-white"
                                            : "bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground/60 hover:bg-black/5 dark:hover:bg-white/5"
                                            }`}
                                    >
                                        USDT
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('USDC')}
                                        className={`py-4 px-4 rounded-[1.2rem] border text-sm font-semibold transition-all shadow-sm ${currency === 'USDC'
                                            ? "bg-gradient-to-br from-cyan-400 to-purple-600 border-transparent text-white"
                                            : "bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground/60 hover:bg-black/5 dark:hover:bg-white/5"
                                            }`}
                                    >
                                        USDC
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm text-foreground/60 px-2 mt-2 font-medium">
                                <span>Available Balance:</span>
                                <span>${currentBalance.toFixed(2)}</span>
                            </div>

                            <div className="space-y-2 mt-6">
                                <label className="text-sm font-medium text-foreground/80">Amount to Withdraw</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-2xl font-bold text-foreground/40">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={amountStr}
                                        onChange={(e) => setAmountStr(e.target.value)}
                                        required
                                        min="10"
                                        step="0.01"
                                        className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl pl-10 pr-6 py-4 text-3xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mt-6">
                                <label className="text-sm font-medium text-foreground/80">Destination Address (ERC-20)</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                    placeholder="0x..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || parseFloat(amountStr) > currentBalance}
                                className="w-full py-4 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/20 text-white font-bold hover:opacity-90 flex items-center justify-center transition-opacity disabled:opacity-50 mt-6"
                            >
                                {isSubmitting ? 'Processing...' : 'Queue Withdrawal'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleFiatSubmit} className="space-y-6 mt-6">
                            <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 text-center">
                                <p className="text-sm text-foreground/60 font-medium leading-relaxed">
                                    Fiat refunds process available balances back to the original payment method used for deposit.
                                </p>
                            </div>

                            <div className="flex justify-between text-sm text-foreground/60 px-2 mt-2 font-medium">
                                <span>Available USDT Balance:</span>
                                <span>${balances.usdtBalance.toFixed(2)}</span>
                            </div>

                            <div className="space-y-2 mt-6">
                                <label className="text-sm font-medium text-foreground/80">Amount to Refund</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-2xl font-bold text-foreground/40">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="fiatAmount"
                                        value={amountStr}
                                        onChange={(e) => setAmountStr(e.target.value)}
                                        required
                                        min="10"
                                        step="0.01"
                                        className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl pl-10 pr-6 py-4 text-3xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || parseFloat(amountStr) > balances.usdtBalance}
                                className="w-full py-4 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/20 text-white font-bold hover:opacity-90 flex items-center justify-center transition-opacity disabled:opacity-50"
                            >
                                {isSubmitting ? 'Requesting...' : 'Request Fiat Refund'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
