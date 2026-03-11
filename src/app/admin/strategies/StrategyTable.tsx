"use client";

import { useTransition, useState } from 'react';
import { createPortal } from 'react-dom';
import { Strategy } from '@prisma/client';
import { toggleStrategyActive, generateWebhook, deleteStrategy, toggleStrategyPublic, updateStrategySafeSettings } from './actions';

export default function StrategyTable({ strategies }: { strategies: Strategy[] }) {
    return (
        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-border rounded-[2rem] overflow-hidden shadow-2xl shadow-black-[0.03] dark:shadow-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#1D1D1F]">
                    <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground border-b border-border">
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
                    <div className="p-12 text-center text-black/40 font-medium">
                        No strategies active. Create one above to get started.
                    </div>
                )}
            </div>
        </div>
    );
}

function StrategyRow({ strategy }: { strategy: Strategy }) {
    const [isPending, startTransition] = useTransition();
    const [showInstructions, setShowInstructions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

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
                <td className="px-8 py-5 font-bold text-[#1D1D1F] whitespace-nowrap">
                    {strategy.name}
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="font-semibold text-black/80">
                            {strategy.pair || `${strategy.targetExchange} ${strategy.marketType}`} <span className="text-black/40 text-xs ml-1">({strategy.marketType})</span>
                        </span>
                        <span className="text-black/50 text-xs mt-0.5 font-medium">
                            {strategy.leverage}x <span className="opacity-50">(Max: {strategy.maxLeverage}x)</span>
                        </span>
                    </div>
                </td>
                <td className="px-8 py-5 font-bold text-black/70 whitespace-nowrap">
                    {strategy.defaultEquityPercentage}%
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                    <button
                        onClick={handlePublicToggle}
                        disabled={isPending}
                        className={`px-3 py-1 font-bold rounded-full transition-colors disabled:opacity-50 border ${strategy.isPublic
                            ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                            : 'bg-black/5 dark:bg-white/5 text-muted-foreground border-border hover:bg-black/10 dark:hover:bg-white/10'
                            }`}
                    >
                        {strategy.isPublic ? 'Public' : 'Private'}
                    </button>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${strategy.isActive
                        ? 'bg-green-50 text-green-600'
                        : 'bg-black/5 text-black/40'
                        }`}>
                        {strategy.isActive ? 'Active' : 'Paused'}
                    </span>
                </td>
                <td className="px-8 py-5 text-right w-48">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="w-10 h-10 bg-[#F5F5F7] hover:bg-black/5 rounded-full flex items-center justify-center text-black/60 hover:text-[#1D1D1F] transition-colors"
                            title="Edit Settings"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="w-10 h-10 bg-[#F5F5F7] hover:bg-black/5 rounded-full flex items-center justify-center text-black/60 hover:text-[#1D1D1F] transition-colors"
                            title="Webhook Instructions"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleWebhook}
                            disabled={isPending}
                            className="w-10 h-10 bg-[#F5F5F7] hover:bg-black/5 rounded-full flex items-center justify-center text-black/60 hover:text-[#1D1D1F] transition-colors disabled:opacity-50"
                            title="Regenerate Webhook"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={handleToggle}
                            disabled={isPending}
                            className={`${strategy.isActive ? 'text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20' : 'text-green-800 bg-green-100 hover:bg-green-200'} px-5 py-2 rounded-full transition-all flex items-center gap-2 disabled:opacity-50 font-bold text-xs uppercase tracking-tight`}
                            title={strategy.isActive ? 'Kill Switch (Pause)' : 'Reactivate'}
                        >
                            <span className="relative flex h-2 w-2">
                                {strategy.isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${strategy.isActive ? 'bg-white' : 'bg-green-500'}`}></span>
                            </span>
                            {strategy.isActive ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors flex items-center justify-center disabled:opacity-50"
                            title="Delete Strategy"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
            {/* Instructions Modal Overlay (Portaled to body to fix hydration error) */}
            {showInstructions && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-2xl transform transition-all border border-border">
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Strategy Instructions</h3>
                                    <p className="text-black/50 mt-1 font-medium">{strategy.name} Connection Guide</p>
                                </div>
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    title="Close"
                                    className="p-2 bg-[#F5F5F7] hover:bg-black/5 rounded-full text-black/50 hover:text-black transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-black/60 uppercase tracking-wide">1. Webhook URL</h4>
                                    <p className="text-sm text-black/50 mb-2">Paste this exact URL into your TradingView Alert's Webhook URL field. (Replace <code className="bg-black/5 px-1 rounded">your-domain.com</code> with your actual deployed app domain or local ngrok URL).</p>
                                    <div className="relative group">
                                        <code className="block w-full bg-[#1D1D1F] text-white p-4 rounded-[1rem] text-sm overflow-x-auto whitespace-pre font-mono shadow-inner">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/tradingview` : 'https://your-domain.com/api/webhook/tradingview'}
                                        </code>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-black/60 uppercase tracking-wide">2. Webhook Payloads</h4>
                                        <p className="text-sm text-black/50 mb-4 mt-1">
                                            Choose one of the required JSON payload methods Below to transmit signals to AutoAlpha.
                                        </p>
                                    </div>

                                    {/* Method 1: Universal */}
                                    <div className="space-y-2 p-4 bg-black/5 dark:bg-white/5 rounded-[1.5rem] border border-border">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-gray-600 bg-gray-200/50 px-2 py-1 rounded">Method A</span>
                                            <span className="text-sm font-semibold text-[#1D1D1F]">Universal TV Payload</span>
                                        </div>
                                        <p className="text-xs text-black/50 mb-2">Paste this exact block into your TradingView Alert Message box. It relies on TV's native `strategy.order.action` system.</p>
                                        <div className="relative group">
                                            <code className="block w-full bg-[#1D1D1F] text-white p-4 rounded-[1rem] text-[13px] overflow-x-auto whitespace-pre font-mono shadow-inner">
                                                {JSON.stringify({ webhookToken: strategy.webhookToken, symbol: "{{ticker}}", action: "{{strategy.order.action}}", price: "{{strategy.order.price}}", order_id: "{{strategy.order.id}}" }, null, 2)}
                                            </code>
                                        </div>
                                    </div>

                                    {/* Method 2: Pine Script Native */}
                                    <div className="space-y-2 p-4 bg-blue-50/50 rounded-[1.5rem] border border-blue-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Method B</span>
                                            <span className="text-sm font-semibold text-blue-900">Advanced Pine Script (Recommended)</span>
                                        </div>
                                        <p className="text-xs text-blue-800/60 mb-2">Build the precise JSON string exactly inside your Pine Script code variables (e.g. `msg_long`), and paste only this single variable hook into your TradingView Alert Message box:</p>
                                        <div className="relative group mb-3">
                                            <code className="block w-full bg-[#1D1D1F] text-blue-300 p-3 rounded-lg text-[13px] whitespace-pre font-mono shadow-inner font-bold">
                                                {`{{strategy.order.alert_message}}`}
                                            </code>
                                        </div>
                                        <p className="text-xs text-blue-800/60">Example Pine Script Implementation:</p>
                                        <div className="relative group">
                                            <code className="block w-full bg-white border border-blue-100/50 text-blue-900 p-3 rounded-lg text-[11px] overflow-x-auto whitespace-pre font-mono shadow-sm">
                                                {`msg_long = '{"webhookToken": "${strategy.webhookToken}", "symbol": "' + syminfo.ticker + '", "action": "long", "price": ' + str.tostring(close) + ', "order_id": "Long_Entry_01"}'\n\nstrategy.entry("Long", strategy.long, alert_message = msg_long)`}
                                            </code>
                                        </div>
                                    </div>

                                </div>
                                <p className="text-xs text-black/40 font-medium pb-2 text-center">For testing, you can use the `test-webhook.js` Node script to fire signals locally.</p>
                            </div>

                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Modal Overlay */}
            {showEditModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity overflow-y-auto">
                    <div className="bg-white/50 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-2xl transform transition-all border border-border mt-10 mb-10">
                        <form
                            action={async (formData) => {
                                startTransition(async () => {
                                    await updateStrategySafeSettings(strategy.id, formData);
                                    setShowEditModal(false);
                                });
                            }}
                            className="p-8 space-y-6"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Edit Strategy</h3>
                                    <p className="text-black/50 mt-1 font-medium">Safely modify {strategy.name}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    title="Close"
                                    className="p-2 bg-[#F5F5F7] hover:bg-black/5 rounded-full text-black/50 hover:text-black transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black/60 uppercase tracking-wide">Strategy Name</label>
                                    <input required name="name" defaultValue={strategy.name} className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black/60 uppercase tracking-wide">Perf. Fee %</label>
                                    <input required type="number" step="0.1" name="performanceFee" defaultValue={strategy.performanceFeePercentage} className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black/60 uppercase tracking-wide">Default Equity %</label>
                                    <input required type="number" step="0.1" name="defaultEquity" defaultValue={strategy.defaultEquityPercentage} className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black/60 uppercase tracking-wide">Expected ROI %</label>
                                    <input type="number" step="0.1" name="expectedRoi" defaultValue={strategy.expectedRoiPercentage || ''} placeholder="Optional" className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black/60 uppercase tracking-wide">Win Rate %</label>
                                    <input type="number" step="0.1" name="winRate" defaultValue={strategy.winRatePercentage || ''} placeholder="Optional" className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-black/60 uppercase tracking-wide">Max Drawdown %</label>
                                    <input type="number" step="0.1" name="drawdown" defaultValue={strategy.drawdownPercentage || ''} placeholder="Optional" className="w-full bg-[#F5F5F7] text-[#1D1D1F] px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-full font-bold text-black/60 hover:bg-black/5 transition-colors">Cancel</button>
                                <button type="submit" disabled={isPending} className="px-8 py-3 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20">
                                    {isPending ? 'Saving...' : 'Save Strategy'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
