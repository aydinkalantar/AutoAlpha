import { prisma } from "@/lib/prisma";
import { getTradeQueue } from '@/lib/queue';
import { DollarSign, Activity, Users, Box, Info, Network } from 'lucide-react';
import DashboardCharts from './DashboardCharts';
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
    
    let totalRevenue = 0;
    let platformAUM = 0;
    let activeApiConnections = 0;
    let waitingJobsCount = 0;
    let allLedgers: any[] = [];
    
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
        totalRevenue = Math.abs(revenueEntries._sum.amount || 0);

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

        activeApiConnections = await prisma.exchangeKey.count({ 
            where: { isValid: true } 
        });

        const tradeQueue = getTradeQueue();
        waitingJobsCount = await tradeQueue.getWaitingCount();

        allLedgers = await prisma.ledger.findMany({
            where: {
                description: { contains: 'Performance Fee Deducted' },
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
    } catch (e) {
        console.warn("Could not connect to database on admin page. Returning default 0 metrics.");
    }

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
                    title="Platform AUM"
                    value={`$${platformAUM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Active Subscriptions"
                    href="/admin/strategies"
                    icon={<Activity className="w-5 h-5 text-foreground/50" />}
                    tooltip="Assets Under Management. The total virtual capital currently allocated to active strategies across all platform users."
                />
                <KPICard
                    title="Gas Tank Revenue"
                    value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Lifetime API Fees"
                    href="/admin/ledger"
                    icon={<DollarSign className="w-5 h-5 text-foreground/50" />}
                    tooltip="The aggregate sum of all performance fees collected by the platform across all users."
                />
                <KPICard
                    title="Active APIs"
                    value={activeApiConnections.toString()}
                    subtitle="Connected Exchange Valid"
                    href="/admin/investors"
                    icon={<Network className="w-5 h-5 text-foreground/50" />}
                    tooltip="The total number of valid exchange API connections driving live markets."
                />
                <KPICard
                    title="Queue Health"
                    value={waitingJobsCount.toString()}
                    subtitle="Pending Trade Jobs"
                    href="/admin/executions"
                    icon={<Box className="w-5 h-5 text-foreground/50" />}
                    alert={waitingJobsCount > 10}
                    tooltip="Real-time count of pending trade execution jobs waiting in the internal BullMQ Redis queue."
                />
            </div>

            {/* Chart Section */}
            <DashboardCharts ledgers={allLedgers} />
        </div>
    );
}

function KPICard({ title, value, subtitle, icon, alert, tooltip, href }: { title: string, value: string, subtitle: string, icon: React.ReactNode, alert?: boolean, tooltip?: string, href?: string }) {
    const isLongValue = value.length > 9;
    const content = (
        <>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-foreground/50">{title}</h3>
                        {tooltip && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span aria-label={`Info about ${title}`} className="cursor-help focus:outline-none inline-flex items-center">
                                        <Info className="w-4 h-4 text-foreground/30 hover:text-cyan-500 transition-colors" />
                                    </span>
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
                <div className={`font-black text-foreground tracking-tight mb-1 transition-all duration-300 ${isLongValue ? 'text-2xl' : 'text-3xl'}`}>{value}</div>
                <div className="text-xs font-semibold text-foreground/40">{subtitle}</div>
            </div>
        </>
    );

    const cardClassName = "bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-3xl shadow-xl border border-black/5 dark:border-white/10 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all";

    if (href) {
        return (
            <Link href={href} className={`${cardClassName} cursor-pointer`}>
                {content}
            </Link>
        );
    }

    return (
        <div className={cardClassName}>
            {content}
        </div>
    );
}
