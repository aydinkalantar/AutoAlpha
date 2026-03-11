'use client';

import React, { useEffect, useRef } from 'react';
import {
    createChart,
    ColorType,
    IChartApi,
    ISeriesApi,
    UTCTimestamp,
    BusinessDay,
    SeriesMarker
} from 'lightweight-charts';

export interface OHLCVData {
    time: UTCTimestamp | BusinessDay | string; // Pass 'YYYY-MM-DD' or UNIX Epoch (seconds)
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface TradeSignal {
    time: UTCTimestamp | BusinessDay | string; // Must exactly match the type/format you pass to OHLCV
    price: number;
    action: 'long' | 'short' | 'exit';
}

interface TradingChartProps {
    ohlcvData: OHLCVData[];
    tradeSignals?: TradeSignal[];
    colors?: {
        backgroundColor?: string;
        textColor?: string;
        upColor?: string;
        downColor?: string;
        wickUpColor?: string;
        wickDownColor?: string;
    };
}

export default function TradingChart({
    ohlcvData,
    tradeSignals = [],
    colors = {
        backgroundColor: 'transparent',
        textColor: '#9ca3af', // Gray-400
        upColor: '#26a69a',   // Modern Green
        downColor: '#ef5350', // Modern Red
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
    }
}: TradingChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // 1. Initialize the Chart
        // Automatically takes the width/height of the parent div container
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: colors.backgroundColor },
                textColor: colors.textColor,
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
            },
            timeScale: {
                timeVisible: true,     // vital for intraday charts
                secondsVisible: false, // Turn on if mapping microscopic high-frequency trades
                borderColor: 'rgba(42, 46, 57, 0.5)',
            },
            rightPriceScale: {
                borderColor: 'rgba(42, 46, 57, 0.5)',
            },
        });

        chartRef.current = chart;

        // 2. Add Candlestick Series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: colors.upColor,
            downColor: colors.downColor,
            borderVisible: false,
            wickUpColor: colors.wickUpColor,
            wickDownColor: colors.wickDownColor,
        });

        seriesRef.current = candlestickSeries;

        // Set the core market data
        // NOTE: Ensure data is sorted by time ascending BEFORE passing prop
        candlestickSeries.setData(ohlcvData as any);

        // 3. Map Trade Markers
        if (tradeSignals.length > 0) {
            // Must be sorted oldest -> newest to prevent Lightweight Charts errors
            const sortedSignals = [...tradeSignals].sort((a, b) => {
                const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
                const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
                return (timeA as number) - (timeB as number);
            });

            const markers: SeriesMarker<any>[] = sortedSignals.map((signal, index) => {
                let position: SeriesMarker<any>['position'] = 'inBar';
                let color = '#f6ad55'; // Orange for EXIT
                let shape: SeriesMarker<any>['shape'] = 'circle';

                if (signal.action === 'long') {
                    position = 'belowBar';
                    color = '#26a69a'; // Buy Green
                    shape = 'arrowUp';
                } else if (signal.action === 'short') {
                    position = 'aboveBar';
                    color = '#ef5350'; // Sell Red
                    shape = 'arrowDown';
                }

                return {
                    time: signal.time as UTCTimestamp | BusinessDay,
                    position,
                    color,
                    shape,
                    text: signal.action.toUpperCase(),
                    id: `trade_marker_${index}`,
                };
            });

            // 4. Attach Markers
            candlestickSeries.setMarkers(markers);
        }

        // Auto-fit content dynamically
        chart.timeScale().fitContent();

        // Responsive Resizing
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        // 5. Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, [ohlcvData, tradeSignals, colors]);

    return (
        <div className="w-full h-full min-h-[400px] bg-transparent rounded-xl overflow-hidden">
            <div ref={chartContainerRef} className="w-full h-full relative" />
        </div>
    );
}
