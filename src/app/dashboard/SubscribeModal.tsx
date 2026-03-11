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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg">
            <div className="w-full max-w-md bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[1.5rem] shadow-2xl relative overflow-hidden flex flex-col">
                <div className="px-6 py-4 flex justify-between items-center border-b border-black/5 dark:border-white/5">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Subscribe</h2>
                    <button
                        onClick={handleClose}
                        title="Close Modal"
                        aria-label="Close Modal"
                        className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-foreground/50 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground transition-colors font-medium text-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl text-sm font-semibold border border-rose-500/20">
                            {error}
                        </div>
                    )}

                    <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-sm border-b border-black/5 dark:border-white/5 pb-3">
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
                                className="w-full bg-[#F5F5F7] border-2 border-transparent hover:border-black/5 rounded-[1.5rem] px-6 py-5 text-xl font-bold text-[#1D1D1F] focus:outline-none focus:border-black/10 transition-all cursor-pointer"
                            >
                                {connectedExchanges.length > 0 ? (
                                    connectedExchanges.map(ex => (
                                        <option key={ex} value={ex}>
                                            {ex.charAt(0) + ex.slice(1).toLowerCase()}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No API Keys Connected</option>
                                )}
                            </select>
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
                                className="w-full bg-[#F5F5F7] border-2 border-transparent group-hover:border-black/5 rounded-[1.5rem] pl-12 pr-6 py-5 text-3xl font-bold text-[#1D1D1F] focus:outline-none focus:border-black/10 focus:bg-white transition-all tracking-tight"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 border border-black/5 rounded-[1.5rem] bg-white shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#1D1D1F]">Auto-Compound</span>
                            <span className="text-xs font-semibold text-black/40">Reinvest profits automatically</span>
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
                            <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1D1D1F]"></div>
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || parseFloat(capitalStr) > currentBalance}
                            className="w-full py-5 px-6 bg-[#1D1D1F] hover:bg-black disabled:opacity-30 disabled:hover:bg-[#1D1D1F] text-white rounded-[1.5rem] text-lg font-bold transition-all"
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Allocation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
