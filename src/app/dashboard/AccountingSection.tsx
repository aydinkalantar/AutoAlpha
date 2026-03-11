"use client";

import React, { useMemo } from 'react';
import { Download, Fuel, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AccountingProps {
    ledgers: any[];
    positions: any[];
    usdtBalance: number;
    usdcBalance: number;
}

export default function AccountingSection({ ledgers, positions, usdtBalance, usdcBalance }: AccountingProps) {
    const totalBalance = usdtBalance + usdcBalance;

    // Estimate daily burn rate from recent ledgers (e.g. past 30 days)
    const { burnRatePerDay, runwayDays } = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentFees = ledgers.filter(l =>
            l.type === 'FEE_DEDUCTION' &&
            new Date(l.timestamp) > thirtyDaysAgo
        );

        const totalFees30d = recentFees.reduce((acc, curr) => acc + curr.amount, 0);
        const burnRatePerDay = totalFees30d / 30;

        const runwayDays = burnRatePerDay > 0 ? totalBalance / burnRatePerDay : 999;

        return { burnRatePerDay, runwayDays };
    }, [ledgers, totalBalance]);

    const handleDownloadCSV = () => {
        // Simple CSV construction for Positions
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Type,Date,Symbol,Side,Leverage,Entry Price,Exit Price,Amount,Gross PnL,Net PnL,Status\n";

        positions.forEach(pos => {
            const isLong = pos.side === 'LONG' || pos.side === 'BUY';
            let grossPnl = 0;
            if (!pos.isOpen && pos.exitPrice) {
                grossPnl = (isLong ? pos.exitPrice - pos.entryPrice : pos.entryPrice - pos.exitPrice) * pos.filledAmount;
            }
            const dateStr = new Date(pos.timestamp || pos.createdAt).toISOString();

            const row = [
                "TRADE",
                dateStr,
                pos.symbol,
                pos.side,
                pos.leverage || 1,
                pos.entryPrice || 0,
                pos.exitPrice || '',
                pos.filledAmount,
                grossPnl,
                pos.realizedPnl,
                pos.isOpen ? 'OPEN' : 'CLOSED'
            ].join(",");
            csvContent += row + "\n";
        });

        // Ledgers could be added as well or as a separate file, but we will combine in this simplified hub
        csvContent += "\n--- LEDGER HISTORY ---\n";
        csvContent += "Type,Date,Amount,Currency,Description\n";

        ledgers.forEach(l => {
            const dateStr = new Date(l.createdAt).toISOString();
            const row = [
                l.type,
                dateStr,
                l.amount,
                l.currency,
                l.description || ''
            ].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `autoalpha_tax_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isLowGas = runwayDays < 7;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* Smart Gas Tank */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className={`absolute inset-x-0 top-0 h-1 ${isLowGas ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Fuel className={`w-5 h-5 ${isLowGas ? 'text-rose-500' : 'text-emerald-500'}`} />
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">Smart Gas Tank</h3>
                    </div>
                    <p className="text-sm text-foreground/50 mb-6">Estimated runway based on your recent 30-day algorithmic activity.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-foreground/50">Estimated Runway</span>
                        {runwayDays === 999 ? (
                            <span className="text-xl font-bold italic tracking-tight text-foreground/40 mt-2">
                                Calculating...
                            </span>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className={`text-4xl font-black tracking-tight ${isLowGas ? 'text-rose-500' : 'text-foreground'}`}>
                                    {Math.floor(runwayDays)}
                                </span>
                                <span className="text-sm text-foreground/50 font-bold">Days</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center text-sm pt-4 border-t border-black/5 dark:border-white/10">
                        <span className="text-foreground/50">Avg. 30D Burn Rate</span>
                        <span className="font-semibold">${burnRatePerDay.toFixed(2)} / day</span>
                    </div>

                    {isLowGas ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-500 bg-rose-500/10 p-3 rounded-xl mt-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Warning: Gas depleting soon. Top up to ensure uninterrupted trading.</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl mt-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Gas levels are optimal.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tax & Accounting Export */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Download className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">Tax & Accounting Hub</h3>
                    </div>
                    <p className="text-sm text-foreground/50 mb-6">Generate standardized CSV reports for your accountant or tax software.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold">Consolidated Ledger</p>
                            <p className="text-xs text-foreground/50">Trades, Fees, Deposits, Withdrawals</p>
                        </div>
                        <span className="text-xs font-bold text-foreground/40">{ledgers.length + positions.length} Records</span>
                    </div>

                    <button
                        onClick={handleDownloadCSV}
                        className="w-full flex-col py-3 bg-gradient-to-br from-cyan-400 to-purple-600 hover:opacity-90 text-white rounded-[1.2rem] font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1"
                    >
                        <div className="flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            <span>Export Data (CSV)</span>
                        </div>
                        <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest mt-0.5">Jan 1 - Dec 31 ({new Date().getFullYear()})</span>
                    </button>
                    <p className="text-[10px] text-center text-foreground/40 mt-2 uppercase tracking-wide">
                        Powered by AutoAlpha Terminal
                    </p>
                </div>
            </div>
        </div>
    );
}
