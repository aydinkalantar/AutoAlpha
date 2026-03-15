'use client';

import { useState } from 'react';
import { Ledger } from '@prisma/client';
import { Download, Search, Copy, Check } from 'lucide-react';
import { subDays, subMonths, isAfter } from 'date-fns';

type LedgerWithUser = Ledger & { user: { email: string } };

export default function LedgerTable({ ledgers }: { ledgers: LedgerWithUser[] }) {
    const [filter, setFilter] = useState<'ALL' | 'FEES' | 'ADJUSTMENTS'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<'ALL' | '7D' | '30D'>('ALL');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const _filteredLedgers = ledgers.filter(l => {
        // Mock TxID for search and display
        const txId = `txn_${l.id.replace(/-/g, '').substring(0, 12)}`;
        
        // 1. Tab Filter
        if (filter === 'FEES' && !l.description.includes('Performance Fee')) return false;
        if (filter === 'ADJUSTMENTS' && !l.description.includes('Admin')) return false;
        
        // 2. Search Query (Email or TxID)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const emailMatch = l.user?.email.toLowerCase().includes(query);
            const txIdMatch = txId.toLowerCase().includes(query);
            if (!emailMatch && !txIdMatch) return false;
        }

        // 3. Date Range
        if (dateRange !== 'ALL') {
            const date = new Date(l.createdAt);
            if (dateRange === '7D' && !isAfter(date, subDays(new Date(), 7))) return false;
            if (dateRange === '30D' && !isAfter(date, subDays(new Date(), 30))) return false;
        }

        return true;
    });

    const exportToCsv = () => {
        const headers = ['ID', 'Date', 'TxID', 'User Email', 'Type', 'Amount', 'Currency', 'Description'];
        const rows = _filteredLedgers.map(l => {
            const txId = `txn_${l.id.replace(/-/g, '').substring(0, 12)}`;
            return [
                l.id,
                new Date(l.createdAt).toISOString(),
                txId,
                l.user?.email || 'Unknown',
                l.amount >= 0 ? 'CREDIT' : 'DEBIT',
                l.amount.toString(),
                l.currency,
                `"${l.description.replace(/"/g, '""')}"` // Escape quotes for CSV
            ];
        });

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'ALL' ? 'bg-white dark:bg-white/10 shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                    >
                        All Entries
                    </button>
                    <button
                        onClick={() => setFilter('FEES')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'FEES' ? 'bg-white dark:bg-white/10 shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                    >
                        Performance Fees
                    </button>
                    <button
                        onClick={() => setFilter('ADJUSTMENTS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'ADJUSTMENTS' ? 'bg-white dark:bg-white/10 shadow-sm text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                    >
                        Manual Adjustments
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input
                            type="text"
                            placeholder="Search email or TxID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all placeholder:text-foreground/30"
                        />
                    </div>
                    
                    {/* Date Filter */}
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        aria-label="Filter by Date Range"
                        className="w-full md:w-auto px-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all appearance-none cursor-pointer"
                    >
                        <option value="ALL">All Time</option>
                        <option value="7D">Last 7 Days</option>
                        <option value="30D">Last 30 Days</option>
                    </select>

                    <button
                        onClick={exportToCsv}
                        className="flex items-center justify-center gap-2 px-5 py-2 w-full md:w-auto bg-foreground text-background rounded-xl hover:bg-foreground/80 transition-all font-bold text-sm shadow-md shadow-black/10 dark:shadow-white/5 whitespace-nowrap"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black-[0.03] dark:shadow-white/5">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground border-b border-black/5 dark:border-white/10">
                            <tr>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">TxID</th>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {_filteredLedgers.map((ledger) => {
                                const txId = `txn_${ledger.id.replace(/-/g, '').substring(0, 12)}`;
                                const isStablecoin = ['USDT', 'USDC', 'USD'].includes(ledger.currency);
                                const displayedAmount = ledger.amount.toFixed(isStablecoin ? 2 : 4);

                                return (
                                    <tr key={ledger.id} className="hover:bg-black/[0.02] transition-colors">
                                        <td className="px-8 py-5 text-foreground/60 font-medium whitespace-nowrap">
                                            {new Date(ledger.createdAt).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-8 py-5 font-mono text-xs text-foreground/70 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span>{txId.substring(0, 8)}...</span>
                                                <button 
                                                    onClick={() => handleCopy(ledger.id, txId)}
                                                    className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-foreground/50 hover:text-foreground transition-all"
                                                    title="Copy TxID"
                                                >
                                                    {copiedId === ledger.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-medium whitespace-nowrap">
                                            {ledger.user?.email || 'System'}
                                        </td>
                                        <td className="px-8 py-5 font-mono font-bold whitespace-nowrap">
                                            <span className={ledger.amount > 0 ? 'text-green-600' : 'text-foreground'}>
                                                {ledger.amount > 0 ? '+' : ''}{displayedAmount} {ledger.currency}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-foreground/70">
                                            {ledger.description}
                                        </td>
                                    </tr>
                                );
                            })}
                            {_filteredLedgers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-foreground/40 font-semibold">
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
