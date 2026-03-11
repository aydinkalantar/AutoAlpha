"use client";

import { useState } from 'react';
import CreditDebitModal from './CreditDebitModal';
import { User, ExchangeKey } from '@prisma/client';

type UserWithKeys = User & {
    exchangeKeys: ExchangeKey[];
};

interface InvestorTableProps {
    users: UserWithKeys[];
}

export default function InvestorTable({ users }: InvestorTableProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);

    const openAdjustModal = (id: string, email: string) => {
        setSelectedUser({ id, email });
        setModalOpen(true);
    };

    return (
        <>
            <div className="bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-2xl shadow-black-[0.03]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#1D1D1F]">
                        <thead className="bg-[#F5F5F7] text-xs font-bold uppercase text-black/40 border-b border-black/5">
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
                                    <tr key={user.id} className="hover:bg-black/[0.02] transition-colors bg-white">
                                        <td className="px-8 py-6 font-bold text-[#1D1D1F]">
                                            {user.email}
                                        </td>
                                        <td className="px-8 py-6">
                                            {hasValidKeys ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                                                    Connected
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F5F5F7] text-black/40">
                                                    None
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 font-mono font-bold text-[#1D1D1F]">
                                            ${user.usdtBalance.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6 font-mono font-bold text-[#1D1D1F]">
                                            ${user.usdcBalance.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6 flex items-center justify-end">
                                            <button
                                                onClick={() => openAdjustModal(user.id, user.email)}
                                                className="text-[#1D1D1F] bg-[#F5F5F7] px-4 py-2 rounded-full hover:bg-black/5 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-tight"
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
                                    <td colSpan={5} className="px-8 py-16 text-center text-black/40 font-semibold bg-white">
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
