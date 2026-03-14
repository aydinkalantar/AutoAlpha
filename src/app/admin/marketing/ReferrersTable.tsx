import React from 'react';
import { Users, DollarSign, TrendingUp } from 'lucide-react';

export default function ReferrersTable({ referrers }: { referrers: any[] }) {
    if (referrers.length === 0) {
        return (
            <div className="text-center p-12 bg-white/5 dark:bg-black/20 rounded-[2.5rem] border border-black/5 dark:border-white/5 border-dashed">
                <Users className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/40 font-medium">No active referrers found in the network.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/20">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Top Affiliates</h2>
                    <p className="text-foreground/60">Monitor performance and payout statistics for your referral network.</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-black/5 dark:border-white/10 text-foreground/60 text-sm">
                            <th className="px-4 py-4 font-semibold">User</th>
                            <th className="px-4 py-4 font-semibold">Referral Code</th>
                            <th className="px-4 py-4 font-semibold text-center">Network Size</th>
                            <th className="px-4 py-4 font-semibold text-right">Unpaid Balance</th>
                            <th className="px-4 py-4 font-semibold text-right">Lifetime Earned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrers.map((user) => (
                            <tr key={user.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="px-4 py-4">
                                    <p className="font-semibold text-foreground truncate max-w-[200px]">{user.email}</p>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="font-mono text-sm px-2 py-1 bg-black/5 dark:bg-white/10 rounded-md">
                                        {user.referralCode}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="inline-flex items-center justify-center bg-cyan-500/10 text-cyan-500 font-bold px-3 py-1 rounded-full text-sm">
                                        {user._count.referrals}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <p className="font-medium text-foreground">${(user.affiliateBalance || 0).toFixed(2)}</p>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <p className="font-bold text-green-500">${(user.totalAffiliateEarnings || 0).toFixed(2)}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
