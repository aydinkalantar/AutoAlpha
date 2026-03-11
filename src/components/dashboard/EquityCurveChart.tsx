'use client';

import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

interface EquityCurveChartProps {
    strategyId: string;
    expectedRoiPercentage: number | null;
}

// Pseudo-random generator for deterministic chart data based on ID
function seededRandom(seed: number) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

export default function EquityCurveChart({ strategyId, expectedRoiPercentage }: EquityCurveChartProps) {
    const data = useMemo(() => {
        let currentEquity = 10000; // start at $10k
        const points = [];

        // Generate a seed from the string id
        let seed = 0;
        for (let i = 0; i < strategyId.length; i++) {
            seed += strategyId.charCodeAt(i);
        }

        const roi = expectedRoiPercentage || 15;
        const dailyDrift = (roi / 100) / 365;
        const dailyVol = 0.01; // 1% daily volatility

        for (let i = 90; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Random walk with upward drift
            const rand = seededRandom(seed++) * 2 - 1; // -1 to 1
            const change = dailyDrift + rand * dailyVol;
            currentEquity = currentEquity * (1 + change);

            points.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                equity: currentEquity,
            });
        }
        return points;
    }, [strategyId, expectedRoiPercentage]);

    const minEquity = Math.min(...data.map(d => d.equity));
    const maxEquity = Math.max(...data.map(d => d.equity));

    return (
        <div className="w-full h-[400px] mt-8">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                        minTickGap={30}
                    />
                    <YAxis
                        domain={[minEquity * 0.95, maxEquity * 1.05]}
                        tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ color: '#00e7ff', fontWeight: 'bold' }}
                        formatter={(value: any) => {
                            if (typeof value === 'number') {
                                return [`$${value.toFixed(2)}`, 'Simulated Equity']
                            }
                            return [value, 'Simulated Equity']
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="equity"
                        stroke="url(#colorEquity)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorEquity)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
