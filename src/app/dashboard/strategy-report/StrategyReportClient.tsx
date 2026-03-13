"use client";

import React, { useState, useMemo } from 'react';
import StrategyPerformance from '../StrategyPerformance';
import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function StrategyReportClient({ subscriptions, positions, totalBalance }: { subscriptions: any[], positions: any[], totalBalance: number }) {
    
    // Fail-safe view for a zero-subscription user clicking through the sidebar
    if (subscriptions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 py-24 text-center bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl">
                <Activity className="w-16 h-16 text-foreground/20 mb-4" />
                <h2 className="text-2xl font-bold text-foreground tracking-tight">No Active Subscriptions</h2>
                <p className="text-foreground/60 mt-2 max-w-lg mx-auto">You are not currently subscribed to any algorithmic vaults in this environment. Visit the Marketplace to allocate capital to a strategy and generate detailed performance reports.</p>
            </div>
        );
    }

    // Default to initializing the first actively subscribed algorithmic vault
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(subscriptions[0].id);

    const activeSubscription = subscriptions.find(s => s.id === selectedSubscriptionId);
    
    // Ensure we ONLY pass historical closed trades pertaining to the exact API connection the user clicked on
    const strategyPositions = useMemo(() => {
        // Find the subscription object to know which strategy AND exchange to filter by
        const sub = subscriptions.find(s => s.id === selectedSubscriptionId);
        if (!sub) return [];
        // Filter trades where both strategyId AND exchange match (or fallback to matching strategyId if exchange missing from older fills)
        return positions.filter(p => p.strategyId === sub.strategyId && (!p.exchange || p.exchange === sub.exchange));
    }, [positions, selectedSubscriptionId, subscriptions]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Multi-Strategy Glassmorphism Tab Selector Component */}
            <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {subscriptions.map((sub) => (
                    <button
                        key={sub.id}
                        onClick={() => setSelectedSubscriptionId(sub.id)}
                        className={`shrink-0 px-6 py-3 rounded-xl font-bold transition-all text-sm border flex items-center gap-2 ${
                            selectedSubscriptionId === sub.id
                                ? "bg-foreground text-background shadow-lg dark:shadow-white/5"
                                : "bg-white/50 dark:bg-white/5 backdrop-blur-md text-foreground/70 border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${sub.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                        {sub.exchange || sub.strategy?.targetExchange}
                    </button>
                ))}
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-black/5 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative z-10 w-full md:max-w-xl">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{activeSubscription?.strategy?.name || "Strategy"} Report</h2>
                    <p className="text-foreground/60 text-sm mt-1">{activeSubscription?.strategy?.description || "Performance metrics, drawdown mappings, and historical trade logs strictly isolated to this algorithmic vault."}</p>
                </div>
                {activeSubscription && (
                    <div className="relative z-10 flex items-center gap-3 w-full md:w-auto shrink-0">
                        <Link 
                            href={`/dashboard/market/${activeSubscription.strategyId}`} 
                            className="w-full md:w-auto text-center px-6 py-2.5 bg-foreground text-background text-sm font-bold border border-black/5 dark:border-white/10 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
                            Manage Allocation
                        </Link>
                    </div>
                )}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/20 dark:from-white/5 to-transparent skew-x-12 translate-x-10 pointer-events-none" />
            </div>

            <StrategyPerformance 
                closedPositions={strategyPositions} 
                currentBalance={activeSubscription ? activeSubscription.currentVirtualBalance : 0} 
            />
        </div>
    );
}
