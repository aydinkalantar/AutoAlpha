"use client";

import { useState } from "react";
import { Strategy } from "@prisma/client";
import { createSubscription } from "./subscriptionActions";

interface SubscribeModalProps {
    strategy: Strategy;
    userId: string;
    usdtBalance: number;
    usdcBalance: number;
    isPaperMode: boolean;
    connectedExchanges: string[];
    isOpen?: boolean;
    onClose?: () => void;
}

export default function SubscribeModal({ strategy, userId, usdtBalance, usdcBalance, isPaperMode, connectedExchanges, isOpen = false, onClose = () => { } }: SubscribeModalProps) {
    const [isLocalOpen, setIsLocalOpen] = useState(isOpen);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [capitalStr, setCapitalStr] = useState('');
    const [compounding, setCompounding] = useState(false);
    const [selectedExchange, setSelectedExchange] = useState(connectedExchanges.length > 0 ? connectedExchanges[0] : 'BINANCE');
    const [error, setError] = useState('');

    const handleOpen = () => setIsLocalOpen(true);
    const handleClose = () => {
        setIsLocalOpen(false);
        onClose();
    };

    if (!isLocalOpen) return (
        <button onClick={handleOpen} className="w-full relative z-10 py-4 mt-2 bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/20 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
            Subscribe
        </button>
    );

    const currentBalance = strategy.settlementCurrency === 'USDT' ? usdtBalance : usdcBalance;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const capital = parseFloat(capitalStr);
        if (capital > currentBalance) {
            setError('Insufficient balance to fund this strategy.');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('strategyId', strategy.id);
            formData.append('allocatedCapital', capitalStr);
            formData.append('compoundingEnabled', compounding ? 'true' : 'false');
            formData.append('currency', strategy.settlementCurrency);
            formData.append('isPaperMode', isPaperMode ? 'true' : 'false');
            if ((strategy.targetExchange as string) === 'UNIVERSAL') {
                formData.append('exchange', selectedExchange);
            }

            await createSubscription(formData);

            handleClose();
        } catch (err: any) {
            setError(err.message || 'Failed to subscribe to strategy.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:pl-64 bg-black/50 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-black/5 dark:border-white/10 relative transform transition-all duration-300">
                <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Subscribe</h2>
                    <button
                        onClick={handleClose}
                        title="Close Modal"
                        aria-label="Close Modal"
                        className="text-foreground/50 hover:text-foreground transition-colors p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl text-sm font-semibold border border-rose-500/20">
                            {error}
                        </div>
                    )}

                    <div className="bg-gray-100/80 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-4 space-y-3">
                        <div className="flex justify-between items-center text-sm border-b border-black/5 dark:border-white/10 pb-3">
                            <span className="font-semibold text-foreground/60">Strategy</span>
                            <span className="font-bold text-foreground">{strategy.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-foreground/60">Settlement Currency</span>
                            <span className="font-bold text-foreground">{strategy.settlementCurrency}</span>
                        </div>
                    </div>

                    {(strategy.targetExchange as string) === 'UNIVERSAL' && (
                        <div className="space-y-4">
                            <div className="flex justify-between px-1">
                                <label className="text-sm font-semibold text-foreground/60">Execution Exchange</label>
                            </div>
                            <select
                                value={selectedExchange}
                                onChange={(e) => setSelectedExchange(e.target.value)}
                                className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer shadow-sm"
                            >
                                {connectedExchanges.length > 0 ? (
                                    connectedExchanges.map(ex => (
                                        <option key={ex} value={ex}>
                                            {ex.charAt(0) + ex.slice(1).toLowerCase()}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No {isPaperMode ? 'Testnet' : 'Live'} API Keys Connected</option>
                                )}
                            </select>
                            {connectedExchanges.length === 0 && (
                                <p className="text-xs font-semibold text-rose-500/80 px-2 mt-2">
                                    You are currently in {isPaperMode ? 'Sandbox' : 'Live'} mode. You must connect a {isPaperMode ? 'Testnet' : 'Live'} exchange API key in Settings to subscribe.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex justify-between px-1">
                            <label className="text-sm font-semibold text-foreground/60">Allocated Capital</label>
                            <span className="text-xs font-bold text-foreground/40">Available: {currentBalance.toFixed(2)} {strategy.settlementCurrency}</span>
                        </div>

                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground font-bold text-2xl">$</span>
                            <input
                                type="number"
                                required
                                min="10"
                                step="0.01"
                                placeholder="100.00"
                                value={capitalStr}
                                onChange={(e) => setCapitalStr(e.target.value)}
                                autoFocus
                                className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-xl pl-10 pr-4 py-3 text-3xl text-right font-black text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all tracking-tight shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-5 border border-black/5 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-white/5 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">Auto-Compound</span>
                            <span className="text-xs font-semibold text-foreground/40">Reinvest profits automatically</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={compounding}
                                onChange={(e) => setCompounding(e.target.checked)}
                                className="sr-only peer"
                                aria-label="Toggle auto-compounding"
                                title="Toggle auto-compounding"
                            />
                            <div className="w-12 h-7 bg-black/10 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white/30"></div>
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || parseFloat(capitalStr) > currentBalance}
                            className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-gray-300 disabled:to-gray-200 dark:disabled:from-white/10 dark:disabled:to-white/5 disabled:text-foreground/40 text-white rounded-xl text-lg font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:shadow-none"
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Allocation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
