"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    usdtBalance: number;
    usdcBalance: number;
    fiatRefundRequested: boolean;
}

export default function RefundTable({ users }: { users: User[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleExecuteRefund = async (userId: string) => {
        if (!confirm('Are you certain you want to trigger the fiat gateway refund and zero this user balance?')) return;

        startTransition(async () => {
            try {
                const res = await fetch('/api/admin/refund', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });

                const data = await res.json();

                if (data.success) {
                    router.refresh(); // Refresh page data
                    alert('Refund executed successfully');
                } else {
                    alert('Failed to execute refund: ' + data.error);
                }
            } catch (error) {
                console.error(error);
                alert('An unexpected error occurred during refund processing.');
            }
        });
    };

    return (
        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black-[0.03] dark:shadow-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#1D1D1F]">
                    <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground border-b border-black/5 dark:border-white/10">
                        <tr>
                            <th className="px-8 py-5">User Email</th>
                            <th className="px-8 py-5">Total Refund Amount</th>
                            <th className="px-8 py-5">Breakdown</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {users.map((user) => {
                            const total = user.usdtBalance + user.usdcBalance;
                            return (
                                <tr key={user.id} className="hover:bg-black/[0.02] transition-colors bg-white">
                                    <td className="px-8 py-6 font-bold text-[#1D1D1F]">
                                        <div className="flex items-center gap-2">
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-mono text-[#1D1D1F] text-lg font-bold">
                                        ${total.toFixed(2)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1 text-xs font-semibold">
                                            <span className="text-green-600">USDT: {user.usdtBalance.toFixed(2)}</span>
                                            <span className="text-blue-600">USDC: {user.usdcBalance.toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 flex items-center justify-end">
                                        <button
                                            onClick={() => handleExecuteRefund(user.id)}
                                            disabled={isPending}
                                            className="text-[#1D1D1F] bg-[#F5F5F7] px-4 py-2 rounded-full hover:bg-black/5 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-tight disabled:opacity-50"
                                            title="Execute Gateway Refund"
                                        >
                                            <span>
                                                Execute Refund
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-16 text-center text-black/40 font-semibold bg-white">
                                    <span className="flex items-center justify-center gap-2">
                                        No fiat refund requests pending.
                                    </span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
