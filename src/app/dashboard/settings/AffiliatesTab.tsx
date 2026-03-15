import React from 'react';
import { Users, DollarSign, Gift } from 'lucide-react';
import { CopyLinkClient } from './CopyLinkClient';

function StatCard({ title, value, icon: Icon, subtext, colorGroup = "default" }: { title: string, value: string, icon: any, subtext?: string, colorGroup?: "default" | "green" }) {
    const isGreen = colorGroup === "green";

    return (
        <div className={`bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-6 relative overflow-hidden group ${isGreen ? 'hover:border-green-500/30' : 'hover:border-cyan-500/30'} transition-colors`}>
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full group-hover:opacity-100 transition-opacity ${isGreen ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/10' : 'bg-gradient-to-br from-cyan-500/10 to-purple-600/10'}`} />
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-black/5 dark:border-white/10 ${isGreen ? 'bg-gradient-to-br from-green-400/20 to-emerald-600/20' : 'bg-gradient-to-br from-cyan-400/20 to-purple-600/20'}`}>
                    <Icon className={`w-6 h-6 ${isGreen ? 'text-green-400' : 'text-foreground/80'}`} />
                </div>
                <h3 className="text-foreground/60 text-sm font-medium">{title}</h3>
                <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
                {subtext && <p className="text-sm text-green-400 mt-2 font-medium">{subtext}</p>}
            </div>
        </div>
    );
}

export default function AffiliatesTab({ user }: { user: any }) {
    const totalReferrals = user.referrals.length;
    const affiliateLedgers = user.ledgers.filter((l: any) => l.type === 'AFFILIATE_COMMISSION');
    const totalCommissionsEarned = affiliateLedgers.reduce((acc: number, ledger: any) => acc + ledger.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <StatCard
                    title="Total Referred Users"
                    value={totalReferrals.toString()}
                    icon={Users}
                    subtext="Active Network"
                    colorGroup="default"
                />
                <StatCard
                    title="Total Lifetime Commissions"
                    value={`$${totalCommissionsEarned.toFixed(2)}`}
                    icon={DollarSign}
                    subtext="Sent directly to your Gas Tank"
                    colorGroup="green"
                />
            </div>

            <div className="relative z-10">
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 max-w-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Your Unique Link</h2>
                    <p className="text-foreground/60 mb-6">Share this code with your audience during their registration.</p>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Referral Code</label>
                        <CopyLinkClient referralCode={user.referralCode || "Generating..."} />
                    </div>
                </div>
            </div>

            <div className="relative z-10 pt-8">
                <h3 className="text-xl font-bold text-foreground mb-6">Recent Commission Payouts</h3>
                {affiliateLedgers.length === 0 ? (
                    <div className="text-center p-12 bg-white/5 dark:bg-black/20 rounded-3xl border border-black/5 dark:border-white/5 border-dashed">
                        <Gift className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                        <p className="text-foreground/40">No commissions earned yet. Start sharing your code!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {affiliateLedgers.map((ledger: any) => (
                            <div key={ledger.id} className="flex items-center justify-between p-6 bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl">
                                <div>
                                    <p className="text-foreground font-medium">{ledger.description}</p>
                                    <p className="text-foreground/40 text-sm mt-1">
                                        {new Date(ledger.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-400 font-bold text-lg">
                                        +${ledger.amount.toFixed(2)}
                                    </p>
                                    <p className="text-foreground/40 text-sm mt-1">{ledger.currency}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
