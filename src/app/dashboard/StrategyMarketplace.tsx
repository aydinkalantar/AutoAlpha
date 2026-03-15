"use client";

import { useState } from "react";
import SubscribeModal from './SubscribeModal';
import CapitalAllocationModal from './CapitalAllocationModal';
import { updateSubscriptionCapital } from './subscriptionActions';
import { Strategy, MarketType } from "@prisma/client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Active Strategies</h2>

                {/* iOS Style Segmented Control */}
                <div className="bg-black/5 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl flex border border-black/5 dark:border-white/10 relative">
                    {['SPOT', 'FUTURES'].map((tab) => (
                        <Button
                            variant="ghost"
                            key={tab}
                            onClick={() => setActiveTab(tab as MarketType)}
                            className={`relative px-8 py-2.5 rounded-xl text-sm font-bold z-10 transition-colors duration-300 ${activeTab === tab ? 'text-foreground hover:bg-transparent' : 'text-foreground/50 hover:text-foreground hover:bg-transparent'}`}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTabBadge"
                                    className="absolute inset-0 bg-white shadow-sm dark:bg-white/10 rounded-xl z-[-1]"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </Button>
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
                                                <SubscriptionCard 
                                                    key={sub.id} 
                                                    sub={sub} 
                                                    strategy={strategy} 
                                                    setEditingAllocation={setEditingAllocation} 
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-3 border-t border-black/5 dark:border-white/5">
                                            <Button
                                                variant="secondary"
                                                asChild
                                                className="w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-bold"
                                            >
                                                <Link href={`/dashboard/market/${strategy.id}`}>
                                                    View Strategy Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="mt-4 relative z-10 border-t border-black/5 dark:border-white/5 pt-4">
                                        <Button
                                            variant="secondary"
                                            asChild
                                            className="w-full py-6 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-bold text-base rounded-xl"
                                        >
                                            <Link href={`/dashboard/market/${strategy.id}`}>
                                                View Strategy Details
                                            </Link>
                                        </Button>
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
                    isOpen={!!editingAllocation}
                    onClose={() => setEditingAllocation(null)}
                    strategy={editingAllocation.strategy}
                    totalMasterBalance={
                        editingAllocation.sub.allocatedCapital +
                        (editingAllocation.strategy.settlementCurrency === 'USDT' ? usdtBalance : usdcBalance)
                    }
                    currentAllocation={editingAllocation.sub.allocatedCapital}
                    isActive={editingAllocation.sub.isActive}
                    onSave={async (amount) => {
                        await updateSubscriptionCapital(editingAllocation.sub.id, amount);
                        setEditingAllocation(null);
                        window.location.reload();
                    }}
                    onRemove={async () => {
                        const res = await fetch(`/api/user/subscriptions/${editingAllocation.sub.id}`, { method: 'DELETE' });
                        if (res.ok) {
                            setEditingAllocation(null);
                            window.location.reload();
                        } else {
                            throw new Error("Failed to delete subscription");
                        }
                    }}
                />
            )}
        </div>
    );
}

function SubscriptionCard({ sub, strategy, setEditingAllocation }: { sub: any, strategy: Strategy, setEditingAllocation: any }) {
    const [isActive, setIsActive] = useState(sub.isActive);
    const [isToggling, setIsToggling] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const router = useRouter();

    const handleToggleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Prevent default toggle until confirmed if it's currently active
        e.preventDefault();
        if (isActive) {
            setShowWarning(true);
        } else {
            handleToggle();
        }
    };

    const handleToggle = async () => {
        if (isToggling) return;
        setIsToggling(true);
        const nextState = !isActive;
        setIsActive(nextState);

        try {
            const res = await fetch(`/api/user/subscriptions/${sub.id}/toggle`, { method: "POST" });
            if (res.ok) {
                router.refresh();
            } else {
                setIsActive(!nextState); // Rollback optimistic update
            }
        } catch (e) {
            setIsActive(!nextState);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <>
            <div className="py-3 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col gap-3 shadow-sm bg-white/40 dark:bg-white/5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold tracking-tight flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}></span>
                        {sub.exchange || strategy.targetExchange}
                    </span>
                    <label htmlFor={`toggle-strat-${strategy.id}-sub-${sub.id}`} className={`relative inline-flex items-center cursor-pointer ${isToggling ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input
                            id={`toggle-strat-${strategy.id}-sub-${sub.id}`}
                            type="checkbox"
                            className="sr-only peer"
                            title="Toggle Strategy Subscription"
                            checked={isActive}
                            onChange={handleToggleClick}
                            disabled={isToggling}
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
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingAllocation({ sub, strategy })}
                    className="w-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground rounded-lg font-bold transition-all"
                >
                    Manage Allocation
                </Button>
            </div>

            {showWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-black/5 dark:border-white/10 space-y-4 transform transition-all">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Disconnect API?
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            Disabling this exchange connection will immediately and automatically <strong className="text-rose-500">close all open trading positions</strong> managed by this strategy at market price.
                        </p>
                        <p className="text-xs font-semibold text-foreground/50">
                            Do you wish to proceed?
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="secondary" onClick={() => setShowWarning(false)} className="bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground">
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => { setShowWarning(false); handleToggle(); }} className="bg-rose-500 hover:bg-rose-600 text-white">
                                Disconnect
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
