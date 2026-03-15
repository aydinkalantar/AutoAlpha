"use client";

import { useState, useTransition, useMemo } from 'react';
import CreditDebitModal from './CreditDebitModal';
import { User, ExchangeKey } from '@prisma/client';
import { updateUserStatus } from './actions';
import { Search } from 'lucide-react';

type UserWithKeys = User & {
    exchangeKeys: ExchangeKey[];
};

interface InvestorTableProps {
    users: UserWithKeys[];
}

export default function InvestorTable({ users }: InvestorTableProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const openAdjustModal = (id: string, email: string) => {
        setSelectedUser({ id, email });
        setModalOpen(true);
    };

    const handleToggleStatus = (userId: string, currentStatus: boolean) => {
        startTransition(async () => {
            await updateUserStatus(userId, !currentStatus);
        });
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Search filter
            if (searchQuery && !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Status filter
            const hasValidKeys = user.exchangeKeys && user.exchangeKeys.length > 0 && user.exchangeKeys.some(k => k.isValid);
            const isPendingAccount = !(user as any).isActive && user.role !== 'ADMIN';

            if (statusFilter === 'PENDING' && !isPendingAccount) return false;
            if (statusFilter === 'API_CONNECTED' && !hasValidKeys) return false;
            if (statusFilter === 'API_MISSING' && hasValidKeys) return false;

            return true;
        });
    }, [users, searchQuery, statusFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input 
                        type="text" 
                        placeholder="Search by email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm font-medium"
                    />
                </div>
                <select 
                    aria-label="Filter Users by Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm font-medium sm:w-48 appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending Approval</option>
                    <option value="API_CONNECTED">API Connected</option>
                    <option value="API_MISSING">API Missing</option>
                </select>
            </div>

            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black-[0.03] dark:shadow-white/5">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground border-b border-black/5 dark:border-white/10">
                            <tr>
                                <th className="px-8 py-5">User Email</th>
                                <th className="px-8 py-5">API Keys</th>
                                <th className="px-8 py-5">USDT Balance</th>
                                <th className="px-8 py-5">USDC Balance</th>
                                <th className="px-8 py-5 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {filteredUsers.map((user) => {
                                const hasValidKeys = user.exchangeKeys && user.exchangeKeys.length > 0 && user.exchangeKeys.some(k => k.isValid);
                                return (
                                    <tr key={user.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6 font-bold text-foreground flex items-center gap-3 whitespace-nowrap">
                                            {user.email}
                                            {!(user as any).isActive && user.role !== 'ADMIN' && (
                                                <span className="inline-flex items-center px-2 py-[2px] rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-widest shrink-0">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            {hasValidKeys ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 gap-1.5 border border-green-200">
                                                    🟢 API Connected
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 gap-1.5 border border-red-200">
                                                    🔴 API Disconnected
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 font-mono font-bold text-foreground whitespace-nowrap">
                                            ${user.usdtBalance.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6 font-mono font-bold text-foreground whitespace-nowrap">
                                            ${user.usdcBalance.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6 flex items-center justify-end gap-2">
                                            {!(user as any).isActive && user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, (user as any).isActive)}
                                                    disabled={isPending}
                                                    className="text-background bg-foreground px-4 py-2 rounded-full hover:bg-foreground/80 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-tight disabled:opacity-50 whitespace-nowrap"
                                                    title="Approve Account"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openAdjustModal(user.id, user.email)}
                                                className="text-foreground bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-tight whitespace-nowrap"
                                                title="Adjust Balance"
                                            >
                                                <span>
                                                    Credit/Debit
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-foreground/40 font-semibold">
                                        No investors match the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <CreditDebitModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    userId={selectedUser.id}
                    email={selectedUser.email}
                />
            )}
        </div>
    );
}
