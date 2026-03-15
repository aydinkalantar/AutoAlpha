import { prisma } from "@/lib/prisma";
import { getTradeQueue } from '@/lib/queue';
import { DollarSign, Activity, Users, Box, Info } from 'lucide-react';
import RevenueChart from './RevenueChart';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOverviewPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return <div>Access Denied</div>;
    }
    // 1. Total Revenue (Sum of positive Ledger amounts, assuming platform fees are positive in our context or recorded specifically)
    let totalRevenue = 0;
    let platformAUM = 0;
    let activeUsersCount = 0;
    let waitingJobsCount = 0;
    let recentLedgers: any[] = [];
    
    // Group by Day securely
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // Include today as the 30th day
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Start of day

    const chartDataMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        // Format as YYYY-MM-DD strictly in UTC to avoid server timezone mismatches
        const dateStr = d.toISOString().split('T')[0];
        chartDataMap[dateStr] = 0;
    }

    try {
        const revenueEntries = await prisma.ledger.aggregate({
            _sum: {
                amount: true
            },
            where: {
                description: {
                    contains: 'Performance Fee Deducted'
                },
                isPaper: false
            }
        });
        // The amount is negative in the ledger (subtracting from user). So we take absolute value.
        totalRevenue = Math.abs(revenueEntries._sum.amount || 0);

        // 2. Platform AUM (Sum of currentVirtualBalance across all active Subscriptions)
        const activeSubAUM = await prisma.subscription.aggregate({
            _sum: {
                currentVirtualBalance: true
            },
            where: {
                isActive: true,
                isPaper: false
            }
        });
        platformAUM = activeSubAUM._sum.currentVirtualBalance || 0;

        // 3. Active Users
        activeUsersCount = await prisma.user.count({ where: { isActive: true } });

        // 4. Pending Queue Jobs
        const tradeQueue = getTradeQueue();
        waitingJobsCount = await tradeQueue.getWaitingCount();

        // Fetch Last 30 Days Revenue for Chart
        recentLedgers = await prisma.ledger.findMany({
            where: {
                description: { contains: 'Performance Fee Deducted' },
                createdAt: { gte: thirtyDaysAgo },
                isPaper: false
            },
            select: {
                amount: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        recentLedgers.forEach(l => {
            // Match the YYYY-MM-DD format strictly in UTC
            const dateStr = l.createdAt.toISOString().split('T')[0];
            if (chartDataMap[dateStr] !== undefined) {
                chartDataMap[dateStr] += Math.abs(l.amount);
            }
        });
    } catch (e) {
        console.warn("Could not connect to database on admin page. Returning default 0 metrics.");
    }

    // Accumulate for running total chart or just daily bars. Let's do daily revenue area chart.
    const chartData = Object.entries(chartDataMap).map(([date, amount]) => ({
        date: new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: amount
    }));

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-8">
            <div className="relative z-10">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Command Center</h1>
                    <Link href="/dashboard/academy" className="text-foreground/40 hover:text-cyan-500 transition-colors" title="Platform Documentation">
                        <Info className="w-5 h-5" />
                    </Link>
                </div>
                <p className="text-foreground/60 mt-2 text-lg font-medium">Global operations, revenue, and health overview.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Lifetime API Fees"
                    icon={<DollarSign className="w-5 h-5 text-foreground/50" />}
                    tooltip="The aggregate sum of all performance fees collected by the platform across all users."
                />
                <KPICard
                    title="Platform AUM"
                    value={`$${platformAUM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Active Subscriptions"
                    icon={<Activity className="w-5 h-5 text-foreground/50" />}
                    tooltip="Assets Under Management. The total virtual capital currently allocated to active strategies across all platform users."
                />
                <KPICard
                    title="Active Users"
                    value={activeUsersCount.toString()}
                    subtitle="Registered Accounts"
                    icon={<Users className="w-5 h-5 text-foreground/50" />}
                    tooltip="The total number of active users registered on the platform."
                />
                <KPICard
                    title="Queue Health"
                    value={waitingJobsCount.toString()}
                    subtitle="Pending Pending Trade Jobs"
                    icon={<Box className="w-5 h-5 text-foreground/50" />}
                    alert={waitingJobsCount > 10}
                    tooltip="Real-time count of pending trade execution jobs waiting in the internal BullMQ Redis queue."
                />
            </div>

            {/* Chart Section */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/10 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
                <div className="mb-6 relative z-10">
                    <h3 className="text-2xl font-bold text-foreground">30-Day Revenue Validation</h3>
                    <p className="text-sm font-medium text-foreground/50">Daily trailing performance fee capture.</p>
                </div>
                <div className="h-[350px] w-full relative z-10">
                    <RevenueChart data={chartData} />
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, subtitle, icon, alert, tooltip }: { title: string, value: string, subtitle: string, icon: React.ReactNode, alert?: boolean, tooltip?: string }) {
    return (
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-3xl shadow-xl border border-black/5 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-foreground/50">{title}</h3>
                        {tooltip && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button aria-label={`Info about ${title}`} className="cursor-help focus:outline-none">
                                        <Info className="w-4 h-4 text-foreground/30 hover:text-cyan-500 transition-colors" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[250px] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-foreground p-3 rounded-xl shadow-2xl backdrop-blur-xl font-medium leading-relaxed">
                                    <p>{tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>
                <div className={`p-2 rounded-xl backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm ${alert ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/40 dark:bg-white/10 text-foreground/70'}`}>
                    {icon}
                </div>
            </div>
            <div className="relative z-10">
                <div className="text-3xl font-black text-foreground tracking-tight mb-1">{value}</div>
                <div className="text-xs font-semibold text-foreground/40">{subtitle}</div>
            </div>
        </div>
    );
}
