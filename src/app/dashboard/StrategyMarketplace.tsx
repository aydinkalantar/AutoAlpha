"use client";

import { useState } from "react";
import SubscribeModal from './SubscribeModal';
import CapitalAllocationModal from './CapitalAllocationModal';
import { updateSubscriptionCapital } from './subscriptionActions';
import { Strategy, MarketType } from "@prisma/client";
import { motion } from 'framer-motion';
import Link from 'next/link';

interface StrategyMarketplaceProps {
    strategies: Strategy[];
    subscriptions: any[];
    userId: string;
    usdtBalance: number;
    usdcBalance: number;
    isPaperMode: boolean;
    connectedExchanges: string[];
}

export default function StrategyMarketplace({ strategies, subscriptions, userId, usdtBalance, usdcBalance, isPaperMode, connectedExchanges }: StrategyMarketplaceProps) {
    const [activeTab, setActiveTab] = useState<MarketType>('SPOT');
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [editingAllocation, setEditingAllocation] = useState<{ sub: any; strategy: Strategy } | null>(null);

    const filteredStrategies = strategies.filter(s => s.marketType === activeTab);

    return (
        <div id="strategy-marketplace" className="space-y-8 mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Active Strategies</h2>

                {/* iOS Style Segmented Control */}
                <div className="bg-black/5 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl flex border border-black/5 dark:border-white/10 relative">
                    {['SPOT', 'FUTURES'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as MarketType)}
                            className={`relative px-8 py-2.5 rounded-xl text-sm font-bold z-10 transition-colors duration-300 ${activeTab === tab ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTabBadge"
                                    className="absolute inset-0 bg-white shadow-sm dark:bg-white/10 rounded-xl z-[-1]"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStrategies.map(strategy => (
                    <div key={strategy.id} className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 flex flex-col transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(168,85,247,0.15)] shadow-xl relative overflow-hidden border border-black/5 dark:border-white/10 hover:border-purple-500/50 group">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-black tracking-tight text-foreground">{strategy.name}</h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                {strategy.targetExchange}
                            </span>
                        </div>

                        <div className="space-y-4 flex-grow mb-8 relative z-10 border-t border-black/5 dark:border-white/5 pt-4">
                            <div className="flex justify-between items-center text-sm pb-2">
                                <span className="font-semibold tracking-wider uppercase text-xs text-foreground/50">Total Return</span>
                                <span className={`font-black ${strategy.expectedRoiPercentage != null && strategy.expectedRoiPercentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {strategy.expectedRoiPercentage != null ? `${strategy.expectedRoiPercentage > 0 ? '+' : ''}${strategy.expectedRoiPercentage.toFixed(1)}%` : "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-2">
                                <span className="font-semibold tracking-wider uppercase text-xs text-foreground/50">Max Drawdown</span>
                                <span className="font-bold text-rose-500">
                                    {strategy.drawdownPercentage != null ? `-${Math.abs(strategy.drawdownPercentage).toFixed(1)}%` : "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-2">
                                <span className="font-semibold tracking-wider uppercase text-xs text-foreground/50">Settlement</span>
                                <span className="font-bold text-foreground">{strategy.settlementCurrency}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-2">
                                <span className="font-semibold tracking-wider uppercase text-xs text-foreground/50">Performance Fee</span>
                                <span className="font-black text-emerald-500">{strategy.performanceFeePercentage}%</span>
                            </div>
                            {strategy.marketType === 'FUTURES' && (
                                <div className="flex justify-between items-center text-sm pb-2">
                                    <span className="font-semibold tracking-wider uppercase text-xs text-foreground/50">Leverage</span>
                                    <span className="font-bold text-foreground">{strategy.leverage}x</span>
                                </div>
                            )}
                        </div>

                        {(() => {
                            const activeSubs = subscriptions.filter(sub => sub.strategyId === strategy.id);
                            if (activeSubs.length > 0) {
                                return (
                                    <div className="w-full relative z-10 flex flex-col gap-3 mt-2">
                                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                            {activeSubs.map(sub => (
                                                <div key={sub.id} className="py-3 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col gap-3 shadow-sm bg-white/40 dark:bg-white/5 backdrop-blur-md">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold tracking-tight flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${sub.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}></span>
                                                            {sub.exchange || strategy.targetExchange}
                                                        </span>
                                                        <label htmlFor={`toggle-strat-${strategy.id}-sub-${sub.id}`} className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                id={`toggle-strat-${strategy.id}-sub-${sub.id}`}
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                title="Toggle Strategy Subscription"
                                                                checked={sub.isActive}
                                                                onChange={async () => {
                                                                    const res = await fetch(`/api/user/subscriptions/${sub.id}/toggle`, { method: "POST" });
                                                                    if (res.ok) window.location.reload();
                                                                }}
                                                            />
                                                            <div className="w-9 h-5 bg-rose-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-foreground/60">Allocated</span>
                                                        <span className="text-xs font-bold text-foreground">
                                                            ${sub.allocatedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setEditingAllocation({ sub, strategy })}
                                                        className="w-full py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        Manage Capital
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-1 pt-2 border-t border-black/5 dark:border-white/5">
                                            <Link
                                                href={`/dashboard/market/${strategy.id}`}
                                                className="w-full py-2.5 flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground rounded-xl text-sm font-bold transition-all"
                                            >
                                                Details
                                            </Link>
                                            <button
                                                onClick={() => setSelectedStrategy(strategy)}
                                                className="w-full py-2.5 flex items-center justify-center bg-gradient-to-br from-cyan-400/10 to-purple-600/10 hover:from-cyan-400/20 hover:to-purple-600/20 text-foreground dark:text-white rounded-xl text-sm font-bold transition-all border border-purple-500/30"
                                            >
                                                + Exchange
                                            </button>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="grid grid-cols-2 gap-3 mt-2 relative z-10 border-t border-black/5 dark:border-white/5 pt-4">
                                        <Link
                                            href={`/dashboard/market/${strategy.id}`}
                                            className="w-full py-4 flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground rounded-xl font-bold transition-colors"
                                        >
                                            Details
                                        </Link>
                                        <button
                                            onClick={() => setSelectedStrategy(strategy)}
                                            className="w-full py-4 bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/20 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                                        >
                                            Subscribe
                                        </button>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                ))}

                {filteredStrategies.length === 0 && (
                    <div className="col-span-full py-20 flex items-center justify-center text-foreground/40 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-black/5 dark:border-white/5 font-medium">
                        No active {activeTab.toLowerCase()} strategies available at the moment.
                    </div>
                )}
            </div>

            {selectedStrategy && (
                <SubscribeModal
                    strategy={selectedStrategy}
                    userId={userId}
                    usdtBalance={usdtBalance}
                    usdcBalance={usdcBalance}
                    isPaperMode={isPaperMode}
                    connectedExchanges={connectedExchanges}
                    isOpen={true}
                    onClose={() => setSelectedStrategy(null)}
                />
            )}
            {editingAllocation && (
                <CapitalAllocationModal
                    isOpen={true}
                    onClose={() => setEditingAllocation(null)}
                    strategy={editingAllocation.strategy}
                    totalMasterBalance={
                        editingAllocation.sub.allocatedCapital +
                        (editingAllocation.strategy.settlementCurrency === 'USDT' ? usdtBalance : usdcBalance)
                    }
                    currentAllocation={editingAllocation.sub.allocatedCapital}
                    onSave={async (amount) => {
                        await updateSubscriptionCapital(editingAllocation.sub.id, amount);
                        setEditingAllocation(null);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
