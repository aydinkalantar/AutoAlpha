'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Activity, TerminalSquare, AlertCircle, CheckCircle2, Trash2, PauseCircle, PlayCircle, Filter } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

export default function LiveExecutionsClient() {
    const [data, setData] = useState<{ jobs: any[], positions: any[] }>({ jobs: [], positions: [] });
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [isPurging, setIsPurging] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    
    // Filters
    const [envFilter, setEnvFilter] = useState<'ALL' | 'LIVE' | 'SANDBOX'>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ERROR'>('ALL');

    const fetchData = async () => {
        if (isPaused) return; // Don't fetch if paused
        try {
            const res = await fetch('/api/admin/executions');
            
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('API Error');
            }

            const json = await res.json();
            if (json && json.jobs) {
                setData(json);
                setLastRefresh(new Date());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // 3-second God Mode polling
        return () => clearInterval(interval);
    }, [isPaused]); // Re-bind interval if pause state changes

    const handlePurge = async () => {
        if (!confirm('Are you sure you want to permanently delete all completed and failed execution logs from the Redis queue?')) return;
        setIsPurging(true);
        try {
            await fetch('/api/admin/executions', { method: 'DELETE' });
            await fetchData();
        } catch (error) {
            console.error('Failed to purge queue', error);
        } finally {
            setIsPurging(false);
        }
    };

    // Unify and sort logs
    const unifiedLogs = useMemo(() => {
        const logs: any[] = [];

        // Map BullMQ Jobs
        data.jobs.forEach(job => {
            const isPaper = job.data?.isPaper === true;
            logs.push({
                type: 'QUEUE',
                id: `job-${job.id}`,
                timestamp: job.timestamp,
                environment: isPaper ? 'SANDBOX' : 'LIVE',
                entityName: job.data?.strategyId ? `Strategy: ${job.data.strategyId.substring(0,8)}...` : 'System',
                status: job.state === 'failed' ? 'ERROR' : job.state === 'completed' ? 'SUCCESS' : 'PROCESSING',
                message: job.name,
                rawData: job
            });
        });

        // Map Prisma Positions
        data.positions.forEach(pos => {
            logs.push({
                type: 'EXCHANGE',
                id: `pos-${pos.id}`,
                timestamp: new Date(pos.updatedAt).getTime(),
                environment: pos.isPaper ? 'SANDBOX' : 'LIVE',
                entityName: `${pos.strategy?.name || 'Unknown'} - ${pos.user?.email || 'Unknown'}`,
                status: 'SUCCESS', // Assuming positions in DB are successful ccxt dispatches
                message: `${pos.isOpen ? 'OPEN' : 'CLOSE'} ${pos.side} ${pos.filledAmount} ${pos.symbol}`,
                rawData: pos
            });
        });

        // Sort chronologically (newest first)
        let sorted = logs.sort((a, b) => b.timestamp - a.timestamp);

        // Apply Filters
        if (envFilter !== 'ALL') {
            sorted = sorted.filter(log => log.environment === envFilter);
        }
        if (statusFilter === 'ERROR') {
            sorted = sorted.filter(log => log.status === 'ERROR');
        }

        return sorted;
    }, [data, envFilter, statusFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Execution Ledger</h1>
                    <p className="text-foreground/60 mt-2 text-lg">Unified real-time TradingView webhooks and exchange dispatches.</p>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-foreground/50 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl">
                    <span className="flex items-center gap-2 font-bold">
                        <span className="relative flex h-2.5 w-2.5">
                            {!isPaused ? (
                                <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </>
                            ) : (
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            )}
                        </span>
                        {isPaused ? 'Stream Paused' : 'Live Connection'}
                    </span>
                    <span>•</span>
                    <span suppressHydrationWarning>Last pulse: {lastRefresh.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Top Control Bar */}
            <div className="bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Environment Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-background border-black/10 dark:border-white/10 font-bold rounded-xl">
                                <Filter className="w-4 h-4 mr-2 text-foreground/50" />
                                {envFilter === 'ALL' ? 'All Environments' : envFilter === 'LIVE' ? 'Live Only' : 'Sandbox Only'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px] z-[100] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-xl shadow-xl">
                            <DropdownMenuLabel>Environment</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                            <DropdownMenuItem onClick={() => setEnvFilter('ALL')} className="font-medium cursor-pointer focus:bg-black/5 dark:focus:bg-white/5">All Environments</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEnvFilter('LIVE')} className="font-medium cursor-pointer text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-500/10">Live Only</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEnvFilter('SANDBOX')} className="font-medium cursor-pointer text-purple-600 dark:text-purple-400 focus:bg-purple-50 dark:focus:bg-purple-500/10">Sandbox Only</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Status Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-background border-black/10 dark:border-white/10 font-bold rounded-xl">
                                <AlertCircle className="w-4 h-4 mr-2 text-foreground/50" />
                                {statusFilter === 'ALL' ? 'All Status' : 'Errors Only'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[180px] z-[100] bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-xl shadow-xl">
                            <DropdownMenuLabel>Log Status</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                            <DropdownMenuItem onClick={() => setStatusFilter('ALL')} className="font-medium cursor-pointer focus:bg-black/5 dark:focus:bg-white/5">All Logs</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('ERROR')} className="font-medium cursor-pointer text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-500/10">Errors Only</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        variant={isPaused ? "default" : "secondary"}
                        onClick={() => setIsPaused(!isPaused)}
                        className={`rounded-xl font-bold transition-all ${isPaused ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-black/5 dark:bg-white/10'}`}
                    >
                        {isPaused ? <PlayCircle className="w-4 h-4 mr-2" /> : <PauseCircle className="w-4 h-4 mr-2" />}
                        {isPaused ? 'Resume Stream' : 'Pause Stream'}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handlePurge}
                        disabled={isPurging}
                        className="rounded-xl font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                        <Trash2 className={`w-4 h-4 mr-2 ${isPurging ? 'animate-pulse' : ''}`} />
                        {isPurging ? 'Purging...' : 'Purge Logs'}
                    </Button>
                </div>
            </div>

            {/* Unified Terminal Container */}
            <div className="bg-[#1D1D1F] dark:bg-zinc-950 border border-transparent dark:border-white/10 rounded-[2rem] h-[700px] overflow-hidden shadow-2xl relative font-mono text-sm flex flex-col">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 border-b border-white/10 bg-black/40 p-4 sticky top-0 z-10 text-xs font-bold uppercase tracking-wider text-white/50">
                    <div className="col-span-3 lg:col-span-2">Timestamp</div>
                    <div className="col-span-2 hidden lg:block">Context</div>
                    <div className="col-span-4 lg:col-span-3">Entity</div>
                    <div className="col-span-5 hidden md:block">Message / Payload</div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {unifiedLogs.length === 0 && loading && (
                        <div className="h-full flex items-center justify-center text-white/30">
                            <RefreshCw className="w-6 h-6 animate-spin" />
                        </div>
                    )}
                    {unifiedLogs.length === 0 && !loading && (
                        <div className="h-full flex items-center justify-center text-white/30">
                            No matching execution logs found.
                        </div>
                    )}
                    
                    {unifiedLogs.map((log) => (
                        <div key={log.id} className="grid grid-cols-12 gap-4 items-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 transition-colors">
                            {/* Timestamp & Status (F-Pattern Left Anchor) */}
                            <div className="col-span-12 md:col-span-3 lg:col-span-2 flex items-center gap-3">
                                {log.status === 'ERROR' ? (
                                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] flex-shrink-0" title="Error" />
                                ) : log.status === 'SUCCESS' ? (
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" title="Success" />
                                ) : (
                                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse flex-shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.6)]" title="Processing" />
                                )}
                                <span className="text-white/50 text-xs whitespace-nowrap font-medium">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>

                            {/* Context (Environment & Phase) */}
                            <div className="col-span-6 md:col-span-4 lg:col-span-2 flex flex-col justify-center gap-1.5">
                                <span className={`text-[10px] items-center text-center font-bold px-2 py-0.5 rounded w-20 tracking-wider uppercase ${log.environment === 'LIVE' ? 'text-emerald-300 border border-emerald-500/30 bg-emerald-500/10' : 'text-purple-300 border border-purple-500/30 bg-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.15)]'}`}>
                                    {log.environment}
                                </span>
                                <span className="text-[10px] text-white/40 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                                    {log.type === 'QUEUE' ? <TerminalSquare className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                                    {log.type}
                                </span>
                            </div>

                            {/* Entity */}
                            <div className="col-span-6 md:col-span-5 lg:col-span-3 flex flex-col justify-center">
                                <span className="text-white/90 font-bold truncate text-sm tracking-tight" title={log.entityName}>
                                    {log.type === 'QUEUE' && log.entityName.includes('System') ? 'System Event' : log.entityName}
                                </span>
                                <span className="text-white/40 text-xs truncate">
                                    {log.id.split('-')[1]}
                                </span>
                            </div>

                            {/* Message & Payload */}
                            <div className="col-span-12 lg:col-span-5 flex flex-col justify-center gap-1.5 overflow-hidden mt-2 lg:mt-0">
                                <div className={`font-bold text-sm truncate ${log.status === 'ERROR' ? 'text-rose-400' : 'text-emerald-400'}`} title={log.message}>
                                    {log.message}
                                </div>
                                
                                {log.type === 'QUEUE' && log.status === 'ERROR' && (
                                    <div className="text-rose-400/90 text-xs font-medium truncate bg-rose-500/10 px-2 py-1.5 rounded border border-rose-500/20" title={log.rawData.failedReason}>
                                        {log.rawData.failedReason}
                                    </div>
                                )}
                                
                                {log.type === 'EXCHANGE' && (
                                    <div className="text-white/50 text-xs flex gap-3 truncate">
                                        <span><span className="text-white/30">ID:</span> {log.rawData.exchangeOrderId}</span>
                                        <span><span className="text-white/30">PnL:</span> <span className={log.rawData.realizedPnl > 0 ? 'text-emerald-400' : log.rawData.realizedPnl < 0 ? 'text-rose-400' : ''}>{log.rawData.realizedPnl ? `$${log.rawData.realizedPnl.toFixed(4)}` : 'N/A'}</span></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
