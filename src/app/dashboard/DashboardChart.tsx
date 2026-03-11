"use client";

import React, { useMemo } from 'react';
import type { UTCTimestamp } from 'lightweight-charts';
import { Activity } from "lucide-react";
import TradingChart from '@/components/dashboard/TradingChart';

export default function DashboardChart() {
    const { mockOhlcvData, mockSignals } = useMemo(() => {
        const mockOhlcvData = Array.from({ length: 30 }).map((_, i) => {
            const time = (Math.floor(Date.now() / 1000) - ((30 - i) * 86400)) as UTCTimestamp;
            const base = 10000 + (i * 120);
            return {
                time,
                open: base,
                high: base + 200,
                low: base - 50,
                close: base + 100 + (Math.random() * 50)
            };
        });

        const mockSignals = [
            { time: mockOhlcvData[5].time, price: mockOhlcvData[5].close, action: 'long' as const },
            { time: mockOhlcvData[14].time, price: mockOhlcvData[14].high, action: 'exit' as const },
            { time: mockOhlcvData[18].time, price: mockOhlcvData[18].open, action: 'short' as const },
            { time: mockOhlcvData[26].time, price: mockOhlcvData[26].low, action: 'exit' as const },
        ];

        return { mockOhlcvData, mockSignals };
    }, []);

    return (
        <div className="bg-white/50 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div className="flex flex-col mb-6">
                <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                    <Activity className="w-5 h-5 text-cyan-500" />
                    Market Overview
                </h3>
                <p className="text-sm text-foreground/50">Simulated algorithmic market telemetry and backtest visualization.</p>
            </div>

            <div className="h-[300px] sm:h-[400px]">
                <TradingChart ohlcvData={mockOhlcvData} tradeSignals={mockSignals} />
            </div>
        </div>
    );
}
