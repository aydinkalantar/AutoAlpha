import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import { Users, DollarSign, Link as LinkIcon, Gift } from 'lucide-react';

export const dynamic = 'force-dynamic';



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

export default async function AffiliateHubPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;

    let user: any = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                referrals: true,
                ledgers: {
                    where: { type: 'AFFILIATE_COMMISSION' }
                }
            }
        });
    } catch (e) {
        console.warn("Could not fetch user affiliates from database. Returning empty data.");
        user = {
            id: userId,
            referrals: [],
            ledgers: []
        };
    }

    if (!user) {
        redirect("/api/auth/signin");
    }

    const totalReferrals = user.referrals.length;
    const totalCommissionsEarned = user.ledgers.reduce((acc: number, ledger: any) => acc + ledger.amount, 0);

    return (
        <div className="p-8 pt-16 md:p-12 md:pt-20 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 relative z-10 pr-16 md:pr-0">
                <div className="space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-semibold mb-4">
                            <Gift className="w-4 h-4" />
                            Partner Program
                        </div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Affiliate Hub</h1>
                        <p className="text-foreground/60 mt-2 text-lg">Invite traders to AutoAlpha and earn 10% of their generated performance fees.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <StatCard
                    title="Total Referred Users"
                    value={totalReferrals.toString()}
                    icon={Users}
                    subtext="Active Network"
                    colorGroup="default" // Keeps the purple/blue
                />
                <StatCard
                    title="Total Lifetime Commissions"
                    value={`$${totalCommissionsEarned.toFixed(2)}`}
                    icon={DollarSign}
                    subtext="Sent directly to your Gas Tank"
                    colorGroup="green" // Distinct green for money earned
                />
            </div>

            <div className="relative z-10">
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 max-w-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Your Unique Link</h2>
                    <p className="text-foreground/60 mb-6">Share this code with your audience during their registration.</p>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Referral Code</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LinkIcon className="h-5 w-5 text-foreground/40" />
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    title="Referral Code"
                                    placeholder="Referral Code"
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-inner"
                                    value={user.referralCode || "Generating..."}
                                />
                            </div>
                            <button className="px-8 py-4 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/20 text-white font-bold hover:opacity-90 transition-opacity">
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 pt-8">
                <h3 className="text-xl font-bold text-foreground mb-6">Recent Commission Payouts</h3>
                {user.ledgers.length === 0 ? (
                    <div className="text-center p-12 bg-white/5 dark:bg-black/20 rounded-3xl border border-black/5 dark:border-white/5 border-dashed">
                        <Gift className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                        <p className="text-foreground/40">No commissions earned yet. Start sharing your code!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {user.ledgers.map((ledger: any) => (
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
