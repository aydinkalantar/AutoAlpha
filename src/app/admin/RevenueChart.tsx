'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }: { data: { date: string, revenue: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <AreaChart
                data={data}
                margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                }}
            >
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                    width={60}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1D1D1F',
                        borderRadius: '12px',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ color: '#A1A1AA', marginBottom: '4px', fontSize: '12px' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
