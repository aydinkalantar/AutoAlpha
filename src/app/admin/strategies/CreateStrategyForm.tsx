"use client";

import { useState } from 'react';
import { createStrategy } from './actions';

export default function CreateStrategyForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [marketType, setMarketType] = useState('FUTURES');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.currentTarget;

        try {
            const formData = new FormData(form);
            await createStrategy(formData);
            form.reset();
        } catch (err) {
            console.error(err);
            alert('Failed to create strategy');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-border rounded-[2rem] p-8 mb-12 shadow-2xl shadow-black-[0.03] dark:shadow-white/5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
            <h2 className="text-2xl font-bold text-foreground mb-8 tracking-tight relative z-10">Create New Strategy</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Strategy Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            placeholder="Alpha Trend v1"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Pair</label>
                        <select
                            name="pair"
                            required
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        >
                            {marketType === 'SPOT' ? (
                                <>
                                    <optgroup label="USDT Pairs">
                                        <option value="BTC/USDT">BTC/USDT</option>
                                        <option value="ETH/USDT">ETH/USDT</option>
                                        <option value="SOL/USDT">SOL/USDT</option>
                                        <option value="XRP/USDT">XRP/USDT</option>
                                        <option value="DOGE/USDT">DOGE/USDT</option>
                                    </optgroup>
                                    <optgroup label="USDC Pairs">
                                        <option value="BTC/USDC">BTC/USDC</option>
                                        <option value="ETH/USDC">ETH/USDC</option>
                                        <option value="SOL/USDC">SOL/USDC</option>
                                        <option value="XRP/USDC">XRP/USDC</option>
                                        <option value="DOGE/USDC">DOGE/USDC</option>
                                    </optgroup>
                                </>
                            ) : (
                                <>
                                    <optgroup label="USDT-M Futures">
                                        <option value="BTC/USDT:USDT">BTC/USDT:USDT</option>
                                        <option value="ETH/USDT:USDT">ETH/USDT:USDT</option>
                                        <option value="SOL/USDT:USDT">SOL/USDT:USDT</option>
                                        <option value="XRP/USDT:USDT">XRP/USDT:USDT</option>
                                        <option value="DOGE/USDT:USDT">DOGE/USDT:USDT</option>
                                    </optgroup>
                                    <optgroup label="USDC-M Futures">
                                        <option value="BTC/USDC:USDC">BTC/USDC:USDC</option>
                                        <option value="ETH/USDC:USDC">ETH/USDC:USDC</option>
                                        <option value="SOL/USDC:USDC">SOL/USDC:USDC</option>
                                        <option value="XRP/USDC:USDC">XRP/USDC:USDC</option>
                                        <option value="DOGE/USDC:USDC">DOGE/USDC:USDC</option>
                                    </optgroup>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Market Type</label>
                        <select
                            name="marketType"
                            value={marketType}
                            onChange={(e) => setMarketType(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                        >
                            <option value="FUTURES">Futures / Perps</option>
                            <option value="SPOT">Spot Market</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Default Leverage</label>
                        <input
                            type="number"
                            name="leverage"
                            required
                            min="1"
                            step="0.1"
                            defaultValue="1"
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Max Leverage</label>
                        <input
                            type="number"
                            name="maxLeverage"
                            required
                            min="1"
                            step="0.1"
                            defaultValue="3"
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Default Equity %</label>
                        <input
                            type="number"
                            name="defaultEquity"
                            required
                            min="1"
                            max="100"
                            step="1"
                            defaultValue="95"
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Description</label>
                        <input
                            type="text"
                            placeholder="Advanced automated trading"
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Expected ROI (%)</label>
                        <input
                            type="number"
                            name="expectedRoi"
                            step="0.1"
                            defaultValue="12.4"
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Win Rate (%)</label>
                        <input
                            type="number"
                            name="winRate"
                            step="0.1"
                            defaultValue="68.5"
                            min="0"
                            max="100"
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black/60 px-2">Drawdown (%)</label>
                        <input
                            type="number"
                            name="drawdown"
                            step="0.1"
                            defaultValue="15.2"
                            min="0"
                            max="100"
                            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Toggles Row */}
                <div className="flex items-center space-x-3 px-2 pt-2 pb-4">
                    <input
                        type="checkbox"
                        name="isPublic"
                        id="isPublic"
                        className="w-5 h-5 rounded-[0.4rem] border-border text-primary focus:ring-primary/20 bg-background"
                    />
                    <label htmlFor="isPublic" className="text-sm font-semibold text-black/60">
                        Show on Public Landing Page
                    </label>
                </div>

                {/* Hidden Fields for required older values */}
                <input type="hidden" name="targetExchange" value="UNIVERSAL" />
                <input type="hidden" name="currency" value="USDT" />
                <input type="hidden" name="performanceFee" value="30" />

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 px-6 bg-foreground hover:bg-foreground/80 disabled:opacity-30 text-background rounded-[1.2rem] text-lg font-bold transition-all"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Strategy'}
                    </button>
                </div>
            </form>
        </div>
    );
}
