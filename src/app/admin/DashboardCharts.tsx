'use client';

import React, { useState, useMemo } from 'react';
import RevenueChart from './RevenueChart';

interface LedgerData {
    amount: number;
    createdAt: Date;
}

export default function DashboardCharts({ ledgers }: { ledgers: LedgerData[] }) {
    const [timeframe, setTimeframe] = useState<'7D' | '30D' | 'ALL'>('30D');

    const chartData = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        let days = 30;
        if (timeframe === '7D') days = 7;
        if (timeframe === 'ALL') {
            if (ledgers.length > 0) {
                const earliest = new Date(Math.min(...ledgers.map(l => new Date(l.createdAt).getTime())));
                earliest.setHours(0, 0, 0, 0);
                const diffTime = Math.abs(now.getTime() - earliest.getTime());
                days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            } else {
                days = 30;
            }
            if (days < 30) days = 30;
        }

        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - (days - 1));

        const chartDataMap: Record<string, number> = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            chartDataMap[dateStr] = 0;
        }

        ledgers.forEach(l => {
             const createdDate = new Date(l.createdAt);
             if (createdDate >= startDate) {
                 const dateStr = createdDate.toISOString().split('T')[0];
                 if (chartDataMap[dateStr] !== undefined) {
                     chartDataMap[dateStr] += Math.abs(l.amount);
                 }
             }
        });

        return Object.entries(chartDataMap).map(([date, amount]) => ({
             date: new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
             revenue: amount
        }));
    }, [ledgers, timeframe]);

    return (
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/10 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-bold text-foreground">Revenue Validation</h3>
                    <p className="text-sm font-medium text-foreground/50">Daily trailing performance fee capture.</p>
                </div>

                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-full w-full sm:w-auto overflow-x-auto">
                    {(['7D', '30D', 'ALL'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setTimeframe(tab)}
                            className={`flex-[1_0_auto] sm:flex-none px-6 py-2 rounded-full text-xs font-bold transition-all ${
                                timeframe === tab 
                                    ? 'bg-white dark:bg-white/10 text-foreground shadow-sm' 
                                    : 'text-foreground/50 hover:text-foreground/80'
                            }`}
                        >
                            {tab === 'ALL' ? 'All-Time' : tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[350px] w-full relative z-10">
                <RevenueChart data={chartData} />
            </div>
        </div>
    );
}
