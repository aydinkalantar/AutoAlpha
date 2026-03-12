'use client';

import { useState } from 'react';
import { Ledger } from '@prisma/client';
import { Download, Filter } from 'lucide-react';

type LedgerWithUser = Ledger & { user: { email: string } };

export default function LedgerTable({ ledgers }: { ledgers: LedgerWithUser[] }) {
    const [filter, setFilter] = useState<'ALL' | 'FEES' | 'ADJUSTMENTS'>('ALL');

    const filteredLedgers = ledgers.filter(l => {
        if (filter === 'ALL') return true;
        if (filter === 'FEES') return l.description.includes('Performance Fee');
        if (filter === 'ADJUSTMENTS') return l.description.includes('Admin');
        return true;
    });

    const exportToCsv = () => {
        const headers = ['ID', 'Date', 'User Email', 'Type', 'Amount', 'Currency', 'Description'];
        const rows = filteredLedgers.map(l => [
            l.id,
            new Date(l.createdAt).toISOString(),
            l.user?.email || 'Unknown',
            l.amount >= 0 ? 'CREDIT' : 'DEBIT',
            l.amount.toString(),
            l.currency,
            `"${l.description.replace(/"/g, '""')}"` // Escape quotes for CSV
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `autoalpha_ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-white dark:bg-white/10 shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                    >
                        All Entries
                    </button>
                    <button
                        onClick={() => setFilter('FEES')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'FEES' ? 'bg-white dark:bg-white/10 shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                    >
                        Performance Fees
                    </button>
                    <button
                        onClick={() => setFilter('ADJUSTMENTS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'ADJUSTMENTS' ? 'bg-white dark:bg-white/10 shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                    >
                        Manual Adjustments
                    </button>
                </div>

                <button
                    onClick={exportToCsv}
                    className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full hover:bg-foreground/80 transition-all font-bold text-sm shadow-md shadow-black/10 dark:shadow-white/5"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black-[0.03] dark:shadow-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground border-b border-black/5 dark:border-white/10">
                            <tr>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {filteredLedgers.map((ledger) => (
                                <tr key={ledger.id} className="hover:bg-black/[0.02] transition-colors">
                                    <td className="px-8 py-5 text-foreground/60 font-medium whitespace-nowrap">
                                        {new Date(ledger.createdAt).toLocaleString(undefined, {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-8 py-5 font-medium whitespace-nowrap">
                                        {ledger.user?.email || 'System'}
                                    </td>
                                    <td className="px-8 py-5 font-mono font-bold whitespace-nowrap">
                                        <span className={ledger.amount > 0 ? 'text-green-600' : 'text-foreground'}>
                                            {ledger.amount > 0 ? '+' : ''}{ledger.amount.toFixed(4)} {ledger.currency}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-foreground/70">
                                        {ledger.description}
                                    </td>
                                </tr>
                            ))}
                            {filteredLedgers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-16 text-center text-foreground/40 font-semibold">
                                        No ledger entries found for this filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
