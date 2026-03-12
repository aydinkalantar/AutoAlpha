"use client";

import { useState, useTransition } from 'react';
import CreditDebitModal from './CreditDebitModal';
import { User, ExchangeKey } from '@prisma/client';
import { updateUserStatus } from './actions';

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

    const openAdjustModal = (id: string, email: string) => {
        setSelectedUser({ id, email });
        setModalOpen(true);
    };

    const handleToggleStatus = (userId: string, currentStatus: boolean) => {
        startTransition(async () => {
            await updateUserStatus(userId, !currentStatus);
        });
    };

    return (
        <>
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black-[0.03] dark:shadow-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground border-b border-black/5 dark:border-white/10">
                            <tr>
                                <th className="px-8 py-5">User Email</th>
                                <th className="px-8 py-5">API Keys</th>
                                <th className="px-8 py-5">USDT Balance</th>
                                <th className="px-8 py-5">USDC Balance</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {users.map((user) => {
                                const hasValidKeys = user.exchangeKeys && user.exchangeKeys.length > 0 && user.exchangeKeys.some(k => k.isValid);
                                return (
                                    <tr key={user.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6 font-bold text-foreground flex items-center gap-3">
                                            {user.email}
                                            {!(user as any).isActive && user.role !== 'ADMIN' && (
                                                <span className="inline-flex items-center px-2 py-[2px] rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-widest">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {hasValidKeys ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                                                    Connected
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F5F5F7] dark:bg-white/5 text-foreground/40">
                                                    None
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 font-mono font-bold text-foreground">
                                            ${user.usdtBalance.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6 font-mono font-bold text-foreground">
                                            ${user.usdcBalance.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6 flex items-center justify-end gap-2">
                                            {!(user as any).isActive && user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, (user as any).isActive)}
                                                    disabled={isPending}
                                                    className="text-background bg-foreground px-4 py-2 rounded-full hover:bg-foreground/80 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-tight disabled:opacity-50"
                                                    title="Approve Account"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openAdjustModal(user.id, user.email)}
                                                className="text-foreground bg-[#F5F5F7] dark:bg-white/5 px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-tight"
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
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-foreground/40 font-semibold">
                                        No investors found in the system.
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
        </>
    );
}
