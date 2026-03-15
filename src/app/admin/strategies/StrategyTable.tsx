"use client";

import { useTransition } from 'react';
import { Strategy } from '@prisma/client';
import { toggleStrategyActive, generateWebhook, deleteStrategy, toggleStrategyPublic, updateStrategySafeSettings } from './actions';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';

export default function StrategyTable({ strategies }: { strategies: Strategy[] }) {
    return (
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black-[0.03] dark:shadow-white/5">
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm text-foreground">
                    <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground border-b border-black/5 dark:border-white/10">
                        <tr>
                            <th className="px-8 py-5">Name</th>
                            <th className="px-8 py-5">Pair / Lev</th>
                            <th className="px-8 py-5">Def. Equity %</th>
                            <th className="px-8 py-5">Visibility</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right w-48">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {strategies.map((strategy) => (
                            <StrategyRow key={strategy.id} strategy={strategy} />
                        ))}
                    </tbody>
                </table>
                {strategies.length === 0 && (
                    <div className="p-12 text-center text-black/40 dark:text-white/40 font-medium">
                        No strategies active. Create one above to get started.
                    </div>
                )}
            </div>
        </div>
    );
}

function StrategyRow({ strategy }: { strategy: Strategy }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        if (!strategy.isActive || window.confirm(`EMERGENCY PAUSE: Are you sure you want to pause ${strategy.name}? All future TradingView webhooks will be permanently ignored until Reactivated.`)) {
            startTransition(async () => {
                await toggleStrategyActive(strategy.id);
            });
        }
    };

    const handlePublicToggle = () => {
        startTransition(async () => {
            await toggleStrategyPublic(strategy.id);
        });
    };

    const handleWebhook = () => {
        if (window.confirm(`Warning: Regenerating the webhook will break existing TradingView alerts. You must immediately update them with the new URL. Continue?`)) {
            startTransition(async () => {
                await generateWebhook(strategy.id);
            });
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete strategy ${strategy.name}? This action cannot be undone.`)) {
            startTransition(async () => {
                await deleteStrategy(strategy.id);
            });
        }
    };



    return (
        <>
            <tr className="hover:bg-black/[0.02] transition-colors group">
                <td className="px-8 py-5 font-bold text-foreground whitespace-nowrap">
                    {strategy.name}
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="font-semibold text-black/80 dark:text-white/80">
                            {strategy.pair || `${strategy.targetExchange} ${strategy.marketType}`} <span className="text-black/40 dark:text-white/40 text-xs ml-1">({strategy.marketType})</span>
                        </span>
                        <span className="text-foreground/50 text-xs mt-0.5 font-medium">
                            {strategy.leverage}x <span className="opacity-50">(Max: {strategy.maxLeverage}x)</span>
                        </span>
                    </div>
                </td>
                <td className="px-8 py-5 font-bold text-black/70 dark:text-white/70 whitespace-nowrap">
                    {strategy.defaultEquityPercentage}%
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                    <button
                        onClick={handlePublicToggle}
                        disabled={isPending}
                        className={`px-3 py-1 font-bold rounded-full transition-all disabled:opacity-50 text-xs shadow-sm ${strategy.isPublic
                            ? 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600/20 shadow-blue-500/20'
                            : 'bg-secondary text-muted-foreground border border-black/10 dark:border-white/10 hover:bg-secondary/80'
                            }`}
                    >
                        {strategy.isPublic ? 'Public' : 'Private'}
                    </button>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                    <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${strategy.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-black/5 dark:bg-white/5 text-foreground/40 border-transparent'
                        }`}>
                        {strategy.isActive ? 'Active' : 'Paused'}
                    </Badge>
                </td>
                <td className="px-8 py-5 text-right w-48">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-auto focus:outline-none">
                            <MoreHorizontal className="w-5 h-5 text-foreground/60" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-black/5 dark:border-white/10 rounded-xl shadow-xl p-1.5">
                            <DropdownMenuItem asChild className="cursor-pointer font-medium p-2">
                                <Link href={`/admin/strategies/${strategy.id}`}>
                                    Edit Strategy
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer font-medium p-2">
                                <Link href={`/dashboard/strategy-report?id=${strategy.id}`}>
                                    View Strategy Report
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="cursor-pointer font-medium p-2"
                                onClick={() => {
                                    const payload = { 
                                        webhookToken: strategy.webhookToken, 
                                        symbol: "{{ticker}}", 
                                        action: "{{strategy.order.action}}", 
                                        price: "{{strategy.order.price}}", 
                                        order_id: "{{strategy.order.id}}" 
                                    };
                                    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                                    toast.success('Webhook payload copied to clipboard');
                                }}
                            >
                                Copy Webhook Payload
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-black/5 dark:bg-white/10 my-1.5" />
                            <DropdownMenuItem 
                                className="cursor-pointer font-medium p-2"
                                onClick={handleToggle}
                                disabled={isPending}
                            >
                                {strategy.isActive ? 'Pause Strategy' : 'Reactivate Strategy'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="cursor-pointer font-medium text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-500/10 p-2"
                                onClick={handleDelete}
                                disabled={isPending}
                            >
                                Delete Strategy
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </td>
            </tr>
        </>
    );
}
