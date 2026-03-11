import { prisma } from "@/lib/prisma";
import { Queue } from 'bullmq';
import { DollarSign, Activity, Users, Box } from 'lucide-react';
import RevenueChart from './RevenueChart';


const tradeQueue = new Queue('trade-execution', {
    connection: process.env.REDIS_URL ? new (require('ioredis'))(process.env.REDIS_URL, { maxRetriesPerRequest: null, family: 0 }) : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    }
});

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
    // Actually, looking at TradeWorker: fee is created as `amount: -platformFee, description: 'Performance Fee Deducted'`. If the user was deducted, the system gained it.
    // So system revenue is the sum of all absolute values of fee deductions.
    const revenueEntries = await prisma.ledger.aggregate({
        _sum: {
            amount: true
        },
        where: {
            description: {
                contains: 'Performance Fee Deducted'
            }
        }
    });
    // The amount is negative in the ledger (subtracting from user). So we take absolute value.
    const totalRevenue = Math.abs(revenueEntries._sum.amount || 0);

    // 2. Platform AUM (Sum of currentVirtualBalance across all active Subscriptions)
    const activeSubAUM = await prisma.subscription.aggregate({
        _sum: {
            currentVirtualBalance: true
        },
        where: {
            isActive: true
        }
    });
    const platformAUM = activeSubAUM._sum.currentVirtualBalance || 0;

    // 3. Active Users
    const activeUsersCount = await prisma.user.count();

    // 4. Pending Queue Jobs
    const waitingJobsCount = await tradeQueue.getWaitingCount();

    // Fetch Last 30 Days Revenue for Chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // Include today as the 30th day
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Start of day

    const recentLedgers = await prisma.ledger.findMany({
        where: {
            description: { contains: 'Performance Fee Deducted' },
            createdAt: { gte: thirtyDaysAgo }
        },
        select: {
            amount: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // Group by Day securely
    const chartDataMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        // Format as YYYY-MM-DD local time to avoid UTC shift mismatches
        const dateStr = d.toLocaleDateString('en-CA'); 
        chartDataMap[dateStr] = 0;
    }

    recentLedgers.forEach(l => {
        // Match the YYYY-MM-DD format strictly
        const dateStr = l.createdAt.toLocaleDateString('en-CA');
        if (chartDataMap[dateStr] !== undefined) {
            chartDataMap[dateStr] += Math.abs(l.amount);
        }
    });

    // Accumulate for running total chart or just daily bars. Let's do daily revenue area chart.
    const chartData = Object.entries(chartDataMap).map(([date, amount]) => ({
        date: new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: amount
    }));

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="relative z-10">
                <h1 className="text-4xl font-black tracking-tight text-foreground">Command Center</h1>
                <p className="text-foreground/60 mt-2 text-lg font-medium">Global operations, revenue, and health overview.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Lifetime API Fees"
                    icon={<DollarSign className="w-5 h-5 text-black/50" />}
                />
                <KPICard
                    title="Platform AUM"
                    value={`$${platformAUM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Active Subscriptions"
                    icon={<Activity className="w-5 h-5 text-black/50" />}
                />
                <KPICard
                    title="Active Users"
                    value={activeUsersCount.toString()}
                    subtitle="Registered Accounts"
                    icon={<Users className="w-5 h-5 text-black/50" />}
                />
                <KPICard
                    title="Queue Health"
                    value={waitingJobsCount.toString()}
                    subtitle="Pending Pending Trade Jobs"
                    icon={<Box className="w-5 h-5 text-black/50" />}
                    alert={waitingJobsCount > 10}
                />
            </div>

            {/* Chart Section */}
            <div className="bg-white/50 dark:bg-black/40 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl border border-border relative overflow-hidden">
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

function KPICard({ title, value, subtitle, icon, alert }: { title: string, value: string, subtitle: string, icon: React.ReactNode, alert?: boolean }) {
    return (
        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-2xl p-6 rounded-3xl shadow-xl border border-border flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
            <div className="flex justify-between items-start mb-6 relative z-10">
                <h3 className="text-sm font-bold tracking-wider uppercase text-foreground/50">{title}</h3>
                <div className={`p-2 rounded-xl backdrop-blur-md border border-border shadow-sm ${alert ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/40 dark:bg-white/10 text-foreground/70'}`}>
                    {icon}
                </div>
            </div>
            <div className="relative z-10">
                <div className="text-3xl font-black tracking-tight text-foreground mb-1">{value}</div>
                <div className="text-xs font-semibold text-foreground/40">{subtitle}</div>
            </div>
        </div>
    );
}
