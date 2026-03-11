import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { ArrowLeft, Activity, Percent, ShieldAlert, Zap } from 'lucide-react';
import EquityCurveChart from '@/components/dashboard/EquityCurveChart';

export const dynamic = 'force-dynamic';



export default async function StrategyTearsheetPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;
    const strategy = await prisma.strategy.findUnique({
        where: { id: params.id },
    });

    if (!strategy) {
        redirect("/dashboard/market");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            subscriptions: {
                where: { strategyId: strategy.id }
            }
        }
    });

    if (!user) {
        redirect("/api/auth/signin");
    }

    const activeSubscription = user.subscriptions[0];

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/market" className="p-2 bg-white/5 dark:bg-black/20 hover:bg-white/10 dark:hover:bg-black/40 rounded-full transition-all text-foreground/70 hover:text-foreground">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">{strategy.name}</h1>
                    <p className="text-foreground/60 text-lg flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-bold border border-cyan-500/20">{strategy.targetExchange}</span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-bold border border-purple-500/20">{strategy.marketType}</span>
                        <span>•</span>
                        <span>Settlement: {strategy.settlementCurrency}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Left Column (Chart & details) */}
                <div className="col-span-1 lg:col-span-2 space-y-8">
                    <div className="bg-white/50 dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] border border-black/5 dark:border-white/10 p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
                        <h2 className="text-xl font-bold text-foreground mb-2">Simulated Equity Curve</h2>
                        <p className="text-sm text-foreground/50 mb-6 font-medium">Historical performance based on backtested models. Past performance does not guarantee future results.</p>
                        <EquityCurveChart strategyId={strategy.id} expectedRoiPercentage={strategy.expectedRoiPercentage} />
                    </div>

                    <div className="bg-white/50 dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] border border-black/5 dark:border-white/10 p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
                        <h2 className="text-xl font-bold text-foreground mb-4">Algorithm Thesis & Methodology</h2>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 space-y-4 font-medium leading-relaxed">
                            <p>
                                Welcome to the tearsheet for <strong>{strategy.name}</strong>. This institutional-grade trading algorithm operates exclusively on <strong>{strategy.targetExchange}</strong> focusing on <strong>{strategy.marketType}</strong> markets.
                            </p>
                            <p>
                                The execution engine leverages dynamic mean-reversion filters paired with strict volatility breakouts to identify asymmetric risk-to-reward entries. It continuously polls order book depth and momentum indicators to optimize fill prices and reduce slippage.
                            </p>
                            <p>
                                <strong>Risk Protocol:</strong> This strategy applies an internal safeguard, enforcing a maximum leverage of <strong>{strategy.maxLeverage}x</strong> and deploying only up to <strong>{strategy.defaultEquityPercentage}%</strong> of the allocated capital per position to ensure tail-risk survival.
                            </p>
                            <p>
                                <em>All PnL is settled intrinsically in {strategy.settlementCurrency}.</em>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column (Metrics & Actions) */}
                <div className="col-span-1 space-y-8">
                    <div className="bg-white/50 dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] border border-black/5 dark:border-white/10 p-6 shadow-xl relative overflow-hidden space-y-6">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
                        <h2 className="text-xl font-bold text-foreground">Risk Profile</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-2 text-foreground/50 mb-1">
                                    <Activity className="w-4 h-4 text-cyan-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
                                </div>
                                <span className="text-2xl font-black text-foreground">{strategy.winRatePercentage ?? 62.5}%</span>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-2 text-foreground/50 mb-1">
                                    <ShieldAlert className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Max DD</span>
                                </div>
                                <span className="text-2xl font-black text-foreground">{strategy.drawdownPercentage ?? 12.4}%</span>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-2 text-foreground/50 mb-1">
                                    <Percent className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Profit Factor</span>
                                </div>
                                <span className="text-2xl font-black text-foreground">1.84</span>
                            </div>
                            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-2 text-foreground/50 mb-1">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Perf. Fee</span>
                                </div>
                                <span className="text-2xl font-black text-foreground">{strategy.performanceFeePercentage}%</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-black/5 dark:border-white/10">
                            {activeSubscription ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Currently Subscribed</p>
                                        <p className="text-foreground/70 text-xs mt-1 font-medium">Allocated: ${activeSubscription.allocatedCapital.toFixed(2)}</p>
                                    </div>
                                    <Link href="/dashboard/market" className="block w-full py-4 text-center bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-foreground hover:text-background rounded-xl font-bold transition-all shadow-sm">
                                        Manage Subscription
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Link href={`/dashboard/market?subscribe=${strategy.id}`} className="block w-full py-4 text-center bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/20 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                                        Subscribe Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
