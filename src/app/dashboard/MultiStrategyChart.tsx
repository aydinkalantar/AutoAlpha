"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, SeriesMarker } from 'lightweight-charts';

// --- Type Definitions ---
export type OHLCVData = {
    time: string | number; // lightweight-charts expects either a string 'YYYY-MM-DD' or a unix timestamp (seconds)
    open: number;
    high: number;
    low: number;
    close: number;
};

export type StrategyMarker = {
    time: string | number;
    price: number;
    action: 'LONG' | 'SHORT' | 'EXIT';
};

export type StrategyData = {
    id: string;
    name: string;
    themeColor: string;
    markers: StrategyMarker[];
};

interface MultiStrategyChartProps {
    ohlcvData: OHLCVData[];
    strategies: StrategyData[];
}

export default function MultiStrategyChart({ ohlcvData, strategies }: MultiStrategyChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    // State for Layer Toggle UI
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // 1. Chart Initialization & Cleanup
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create the lightweight-chart instance with a premium dark-mode aesthetic
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: 'solid' as any, color: 'transparent' },
                textColor: '#9ca3af', // text-gray-400
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            autoSize: true, // Handle resizing out of the box (requires wrapper width/height)
        });

        // Create the candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        // Set the primary price data
        // Data must be sorted by time ascending for lightweight-charts
        const sortedData = [...ohlcvData].sort((a, b) => {
            const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : (a.time as number);
            const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : (b.time as number);
            return timeA - timeB;
        });
        candlestickSeries.setData(sortedData as any);

        // Store refs for dynamic updates
        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        // Fully Responsive via ResizeObserver logic (if autoSize is not enough)
        const resizeObserver = new ResizeObserver((entries) => {
            if (chartContainerRef.current && entries.length > 0) {
                const newRect = entries[0].contentRect;
                chart.applyOptions({ width: newRect.width, height: newRect.height });
            }
        });
        resizeObserver.observe(chartContainerRef.current);

        // Cleanup function destroys the chart instance to prevent memory leaks
        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
                seriesRef.current = null;
            }
        };
    }, [ohlcvData]);

    // 2. Dynamic Marker Logic based on Active Filter
    useEffect(() => {
        if (!seriesRef.current) return;

        let formattedMarkers: SeriesMarker<Time>[] = [];

        // Helper func to convert custom marker properties into lightweight-chart marker objects
        const mapMarker = (m: StrategyMarker, color: string): SeriesMarker<Time> => {
            const isEntry = m.action === 'LONG' || m.action === 'SHORT';
            const isLong = m.action === 'LONG';

            return {
                time: m.time as Time,
                position: isEntry ? (isLong ? 'belowBar' : 'aboveBar') : 'inBar',
                color: color,
                shape: isEntry ? (isLong ? 'arrowUp' : 'arrowDown') : 'circle',
                text: isEntry ? m.action : 'EXIT',
                size: 1
            };
        };

        if (activeFilter === 'all') {
            // Flatten all strategies together
            strategies.forEach((strat) => {
                const stratMarkers = strat.markers.map(m => mapMarker(m, strat.themeColor));
                formattedMarkers.push(...stratMarkers);
            });
        } else {
            // Find specific strategy and render only its markers using its designated theme color
            const selectedStrategy = strategies.find(s => s.id === activeFilter);
            if (selectedStrategy) {
                formattedMarkers = selectedStrategy.markers.map(m => mapMarker(m, selectedStrategy.themeColor));
            }
        }

        // Lightweight-charts requires markers to be strictly ordered by time ascending
        formattedMarkers.sort((a, b) => {
            const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : (a.time as number);
            const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : (b.time as number);
            return timeA - timeB;
        });

        // Apply to the active series
        seriesRef.current.setMarkers(formattedMarkers);

    }, [activeFilter, strategies]);

    return (
        <div className="flex flex-col w-full h-full space-y-4">

            {/* The Layer Toggle UI (Filter Pills) */}
            <div className="flex flex-row items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeFilter === 'all'
                            ? 'bg-foreground/10 text-foreground border border-transparent'
                            : 'bg-transparent text-foreground/50 border border-black/10 dark:border-white/10 hover:border-foreground/30'
                        }`}
                >
                    All Strategies
                </button>

                {strategies.map((strat) => {
                    const isActive = activeFilter === strat.id;
                    return (
                        <button
                            key={strat.id}
                            onClick={() => setActiveFilter(strat.id)}
                            style={{
                                backgroundColor: isActive ? strat.themeColor : 'transparent',
                                borderColor: isActive ? 'transparent' : strat.themeColor,
                                color: isActive ? '#fff' : strat.themeColor,
                            }}
                            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all border whitespace-nowrap opacity-90 hover:opacity-100"
                        >
                            {strat.name}
                        </button>
                    );
                })}
            </div>

            {/* Chart Container */}
            <div className="w-full flex-grow min-h-[400px] border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden bg-white/50 dark:bg-[#1C1C1E]/50 backdrop-blur-md relative">
                {ohlcvData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground/50 text-sm">
                        Loading market data...
                    </div>
                ) : (
                    <div ref={chartContainerRef} className="w-full h-full" />
                )}
            </div>

        </div>
    );
}
