'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Activity, TerminalSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LiveExecutionsClient() {
    const [data, setData] = useState<{ jobs: any[], positions: any[] }>({ jobs: [], positions: [] });
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/executions');
            const json = await res.json();
            setData(json);
            setLastRefresh(new Date());
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
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-[#1D1D1F] tracking-tight">Live Terminal</h1>
                    <p className="text-black/50 mt-2 font-medium">Real-time TradingView webhook receipts and execution status.</p>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-black/50">
                    <span className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        Live Connection
                    </span>
                    <span>•</span>
                    <span>Last pulse: {lastRefresh.toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BullMQ Jobs Feed */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TerminalSquare className="w-5 h-5 text-black/40" />
                        <h2 className="text-lg font-bold text-[#1D1D1F]">Queue Engine Jobs</h2>
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-black/5 text-[10px] font-bold uppercase tracking-widest text-black/40">BullMQ</span>
                    </div>

                    <div className="bg-[#1D1D1F] rounded-[2rem] p-6 h-[600px] overflow-y-auto space-y-4 shadow-2xl relative font-mono text-sm">
                        {data.jobs.length === 0 && loading && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/30">
                                <RefreshCw className="w-6 h-6 animate-spin" />
                            </div>
                        )}
                        {data.jobs.length === 0 && !loading && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/30">
                                No active or recent jobs found.
                            </div>
                        )}
                        {data.jobs.map((job) => (
                            <div key={job.id} className="border border-white/10 rounded-xl p-4 bg-black/30 backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                                    <div className="flex items-center gap-2">
                                        {job.state === 'failed' ? (
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                        ) : job.state === 'completed' ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                                        )}
                                        <span className="text-white/80 font-bold">{job.name} <span className="text-white/30 font-normal">#{job.id}</span></span>
                                    </div>
                                    <span className="text-xs text-white/40">{new Date(job.timestamp).toLocaleTimeString()}</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-white/50 text-xs uppercase tracking-wide">Payload Data</div>
                                    <pre className="text-green-400/90 overflow-x-auto text-xs">
                                        {JSON.stringify(job.data, null, 2)}
                                    </pre>
                                </div>

                                {job.failedReason && (
                                    <div className="mt-3 p-3 bg-red-950/50 rounded-lg border border-red-500/20 text-red-300 text-xs overflow-x-auto">
                                        <span className="font-bold uppercase tracking-wider block mb-1 text-[10px]">Stack Trace / Reason</span>
                                        {job.failedReason}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Prisma Positions Feed */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-black/40" />
                        <h2 className="text-lg font-bold text-[#1D1D1F]">Exchange Dispatches</h2>
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-black/5 text-[10px] font-bold uppercase tracking-widest text-black/40">ccxt Success</span>
                    </div>

                    <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] border border-border p-6 h-[600px] overflow-y-auto space-y-4 shadow-sm shadow-black-[0.03] dark:shadow-white/5">
                        {data.positions.length === 0 && !loading && (
                            <div className="h-full flex items-center justify-center text-black/30 font-medium text-sm">
                                No exchange positions recorded recently.
                            </div>
                        )}
                        {data.positions.map((pos) => (
                            <div key={pos.id} className="border border-border rounded-xl p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative overflow-hidden">
                                {pos.isOpen && (
                                    <div className="absolute top-0 right-0 p-1">
                                        <span className="flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-[#1D1D1F] text-lg">{pos.symbol} <span className="text-black/40 font-medium text-sm ml-1">{pos.side}</span></span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${pos.isOpen ? 'bg-blue-50 text-blue-600' : 'bg-black/5 text-black/50'}`}>
                                        {pos.isOpen ? 'OPEN' : 'CLOSED'}
                                    </span>
                                </div>
                                <div className="text-sm font-medium text-black/60 mb-4">{pos.strategy?.name} &rarr; {pos.user?.email}</div>

                                <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t border-border pt-4">
                                    <div>
                                        <div className="text-black/40 text-xs mb-0.5 uppercase tracking-wider font-bold">Qty / Size</div>
                                        <div className="font-mono text-[#1D1D1F] font-semibold">{pos.filledAmount}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-black/40 text-xs mb-0.5 uppercase tracking-wider font-bold">Exchange ID</div>
                                        <div className="font-mono text-black/60 truncate" title={pos.exchangeOrderId}>{pos.exchangeOrderId}</div>
                                    </div>
                                    {(!pos.isOpen && pos.realizedPnl !== undefined) && (
                                        <div className="col-span-2 mt-2 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-border flex justify-between items-center">
                                            <div className="text-black/50 font-bold uppercase tracking-widest text-[10px]">Net PnL (After Fees)</div>
                                            <div className={`font-mono font-bold ${pos.realizedPnl > 0 ? 'text-green-600' : pos.realizedPnl < 0 ? 'text-red-500' : 'text-black/80'}`}>
                                                {pos.realizedPnl > 0 ? '+' : ''}${pos.realizedPnl.toFixed(4)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
