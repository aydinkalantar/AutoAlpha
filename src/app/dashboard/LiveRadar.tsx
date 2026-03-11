"use client";

import React, { useEffect, useState } from 'react';
import type { UTCTimestamp } from 'lightweight-charts';
import { Activity, XCircle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

type Position = {
    id: string;
    exchangeOrderId: string;
    symbol: string;
    side: "LONG" | "SHORT" | "BUY" | "SELL";
    filledAmount: number;
    entryPrice: number;
    timestamp: Date;
    exchange: string;
    leverage: number;
}

interface LiveRadarProps {
    openPositions: Position[];
}

export default function LiveRadar({ openPositions: initialPositions }: LiveRadarProps) {
    const [openPositions, setOpenPositions] = useState<Position[]>(initialPositions);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [loadingCloseId, setLoadingCloseId] = useState<string | null>(null);

    // Sync state if props change (e.g., from toggling testnet mode)
    useEffect(() => {
        setOpenPositions(initialPositions);
    }, [initialPositions]);

    // Live Polling for New/Closed Positions
    useEffect(() => {
        const fetchActivePositions = async () => {
            try {
                // Check the first position's isPaper status as the context (assuming UI is locked to one mode)
                const isPaper = initialPositions.length > 0 ? (initialPositions[0] as any).isPaper : true; // Defaulting true to be safe
                const res = await fetch(`/api/user/positions/active?isPaper=${isPaper}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.positions) {
                        setOpenPositions(data.positions);
                    }
                }
            } catch (error) {
                console.error("Error polling active positions:", error);
            }
        };

        const interval = setInterval(fetchActivePositions, 5000);
        return () => clearInterval(interval);
    }, [initialPositions]);

    // Filter only unique symbols from the open positions
    const symbols = Array.from(new Set(openPositions.map(p => p.symbol)));

    useEffect(() => {
        if (symbols.length === 0) return;

        // Poll Binance Public API every 3 seconds for active symbols
        const fetchPrices = async () => {
            try {
                // Formatting symbol for Binance e.g. BTC/USDT to BTCUSDT
                const proms = symbols.map(async (symbol) => {
                    let formattedSymbol = symbol.replace('/', '').toUpperCase();
                    if (formattedSymbol.endsWith('USD') && !formattedSymbol.endsWith('USDT')) {
                        formattedSymbol += 'T';
                    }
                    const res = await fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${formattedSymbol}`);
                    const data = await res.json();
                    return { symbol, price: parseFloat(data.price) };
                });

                const results = await Promise.all(proms);
                const newPrices: Record<string, number> = {};
                results.forEach(r => {
                    newPrices[r.symbol] = r.price;
                });
                setPrices(newPrices);
            } catch (error) {
                console.error("Error fetching live prices:", error);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 3000);
        return () => clearInterval(interval);
    }, [symbols.join(',')]);

    const handleForceClose = async (positionId: string) => {
        setLoadingCloseId(positionId);
        try {
            const res = await fetch(`/api/user/positions/${positionId}/close`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to queue close job");
            // In a real app we'd show a toast or wait for the webhook to reconcile.
            alert("Emergency close job dispatched to engine.");
            // Don't need to force reload anymore, the 5-second polling will automatically clear it!
            // setTimeout(() => window.location.reload(), 3500);
        } catch (error) {
            console.error(error);
            alert("Failed to dispatch close action.");
            setLoadingCloseId(null);
        }
    };

    if (openPositions.length === 0) {
        return (
            <div className="bg-white/50 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl p-6 text-center py-12">
                <Activity className="w-12 h-12 text-cyan-500/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold tracking-tight mb-2">No Active Positions</h3>
                <p className="text-sm text-foreground/50">Execution engine is patiently scanning the market for new opportunities...</p>
            </div>
        );
    }

    return (
        <div className="bg-white/50 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="p-6">
                <div className="flex flex-col mb-6">
                    <h3 className="flex items-center justify-between text-xl tracking-tight font-semibold">
                        <div className="flex items-center gap-2">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                            </div>
                            Live Radar
                        </div>
                    </h3>
                    <p className="text-sm text-foreground/50 mt-1">The engine is actively managing these open positions.</p>
                </div>

                <div className="overflow-x-auto pb-4">
                    {/* Desktop Table View */}
                    <table className="hidden md:table w-full text-sm text-left">
                        <thead className="text-xs text-foreground/50 uppercase border-b border-black/5 dark:border-white/10">
                            <tr>
                                <th className="py-3 px-4">Asset</th>
                                <th className="py-3 px-4">Side</th>
                                <th className="py-3 px-4 text-right">Entry Price</th>
                                <th className="py-3 px-4 text-right">Mark Price</th>
                                <th className="py-3 px-4 text-right">Live PnL</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {openPositions.map((pos) => {
                                const livePrice = prices[pos.symbol];
                                const isLong = pos.side === "LONG" || pos.side === "BUY";

                                let pnl = null;
                                let pnlPerc = null;
                                let pnlColor = "text-foreground/50";

                                if (livePrice) {
                                    const notionalSize = pos.filledAmount * livePrice;
                                    const entryNotionalSize = pos.filledAmount * pos.entryPrice;

                                    if (isLong) {
                                        pnl = notionalSize - entryNotionalSize;
                                    } else {
                                        pnl = entryNotionalSize - notionalSize;
                                    }

                                    // Multiply by leverage and factor margin requirement
                                    const positionMargin = entryNotionalSize / pos.leverage;
                                    pnlPerc = (pnl / positionMargin) * 100;

                                    if (pnl > 0) pnlColor = "text-emerald-500";
                                    else if (pnl < 0) pnlColor = "text-rose-500";
                                }

                                return (
                                    <tr key={pos.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 font-semibold">{pos.symbol}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${isLong ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" : "text-rose-500 border-rose-500/30 bg-rose-500/10"}`}>
                                                {pos.side} {pos.leverage}x
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right tabular-nums text-foreground/70">${pos.entryPrice.toFixed(4)}</td>
                                        <td className="py-4 px-4 text-right tabular-nums font-medium">
                                            {livePrice ? `$${livePrice.toFixed(4)}` : "Loading..."}
                                        </td>
                                        <td className={`py-4 px-4 text-right tabular-nums font-bold ${pnlColor}`}>
                                            {pnl !== null && pnlPerc !== null ? (
                                                <div className="flex flex-col items-end">
                                                    <span>{pnl > 0 ? '+' : ''}${pnl.toFixed(2)}</span>
                                                    <span className="text-xs opacity-80">{pnlPerc > 0 ? '+' : ''}{pnlPerc.toFixed(2)}%</span>
                                                </div>
                                            ) : (
                                                "..."
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                disabled={loadingCloseId === pos.id}
                                                onClick={() => handleForceClose(pos.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition-colors disabled:opacity-50"
                                            >
                                                {loadingCloseId === pos.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                                Close
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col gap-4 mt-2">
                        {openPositions.map((pos) => {
                            const livePrice = prices[pos.symbol];
                            const isLong = pos.side === "LONG" || pos.side === "BUY";
                            let pnl = null;
                            let pnlPerc = null;
                            let pnlColor = "text-foreground/50";

                            if (livePrice) {
                                const notionalSize = pos.filledAmount * livePrice;
                                const entryNotionalSize = pos.filledAmount * pos.entryPrice;

                                if (isLong) {
                                    pnl = notionalSize - entryNotionalSize;
                                } else {
                                    pnl = entryNotionalSize - notionalSize;
                                }

                                const positionMargin = entryNotionalSize / pos.leverage;
                                pnlPerc = (pnl / positionMargin) * 100;

                                if (pnl > 0) pnlColor = "text-emerald-500";
                                else if (pnl < 0) pnlColor = "text-rose-500";
                            }

                            return (
                                <div key={pos.id} className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg">{pos.symbol}</span>
                                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${isLong ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" : "text-rose-500 border-rose-500/30 bg-rose-500/10"}`}>
                                                {pos.side} {pos.leverage}x
                                            </span>
                                        </div>
                                        <div className={`text-right font-bold ${pnlColor} text-lg`}>
                                            {pnl !== null && pnlPerc !== null ? (
                                                <span>{pnl > 0 ? '+' : ''}${pnl.toFixed(2)}</span>
                                            ) : (
                                                <RefreshCw className="w-4 h-4 animate-spin text-foreground/30" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-foreground/50 text-xs font-semibold">Entry</span>
                                            <span className="font-mono text-foreground/80">${pos.entryPrice.toFixed(4)}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-foreground/50 text-xs font-semibold">Mark</span>
                                            <span className="font-mono text-foreground/80">{livePrice ? `$${livePrice.toFixed(4)}` : "..."}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                                        <div className={`text-sm font-bold opacity-80 ${pnlColor}`}>
                                            {pnlPerc !== null ? `${pnlPerc > 0 ? '+' : ''}${pnlPerc.toFixed(2)}% ROI` : ''}
                                        </div>
                                        <button
                                            disabled={loadingCloseId === pos.id}
                                            onClick={() => handleForceClose(pos.id)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {loadingCloseId === pos.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Close
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
