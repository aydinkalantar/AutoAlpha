"use client";

import { useState, useTransition } from "react";
import { saveApiKey, deleteApiKey, saveTestnetApiKey, enableOneClickPaperTrading } from "./actions";
import { ExchangeKey } from "@prisma/client";

interface ApiKeyFormProps {
    userId: string;
    existingKeys: ExchangeKey[];
    isTestnetMode: boolean;
}

export default function ApiKeyForm({ userId, existingKeys, isTestnetMode }: ApiKeyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.currentTarget;
        if (!acceptedTerms) {
            alert('You must acknowledge the API Security & Strategy Terms before connecting.');
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = new FormData(form);
            await saveApiKey(formData);
            form.reset();
            alert('API Key saved and securely encrypted!');
        } catch (err) {
            console.error(err);
            alert('Failed to save API Key');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTestnetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.currentTarget;

        try {
            const formData = new FormData(form);
            await saveTestnetApiKey(formData);
            form.reset();
            alert('Testnet API Key saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save Testnet API Key');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOneClickPaper = async () => {
        setIsSubmitting(true);
        try {
            await enableOneClickPaperTrading(userId);
            alert('1-Click Paper Trading Connected Successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to enable 1-Click Paper Trading');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (keyId: string) => {
        if (!confirm('Are you sure you want to delete this API Key? Any active strategies using this key will fail to execute.')) return;
        startTransition(async () => {
            try {
                await deleteApiKey(keyId);
            } catch (error: any) {
                console.error(error);
                alert(error.message || "Failed to delete key.");
            }
        });
    };

    const activeKeys = existingKeys.filter(k => k.isValid);

    return (
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 mb-8 border border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
            <h2 className="text-2xl font-bold text-foreground mb-8 tracking-tight relative z-10 w-full text-left">
                {isTestnetMode ? 'Sandbox Mode Connections' : 'Connect Exchange'}
            </h2>

            {isTestnetMode ? (
                <div className="space-y-6 relative z-10 fade-in animate-in">
                    {/* 1. Sandbox Header & Warning */}
                    <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-[1.5rem] p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div className="text-left w-full">
                                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-500 mb-1 w-full text-left">Sandbox Mode Active</h3>
                                <p className="text-foreground/80 font-medium">
                                    You are in a safe, simulated environment. No real funds will be used or at risk.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Option A: 1-Click Paper Trading */}
                    <div className="bg-white dark:bg-black/40 border-2 border-cyan-500/40 rounded-[1.5rem] p-8 relative overflow-hidden shadow-lg transition-all hover:border-cyan-500 cursor-default">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="flex-1 text-left">
                                <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">AutoAlpha Simulated Paper Trading</h3>
                                <p className="text-foreground/70 text-lg leading-relaxed mb-0">
                                    Want to test the bots instantly? Use our internal simulator. No exchange accounts or API keys required. We will credit your test account with $10,000 in virtual funds.
                                </p>
                            </div>
                            <div className="w-full md:w-auto shrink-0 flex items-center justify-start md:justify-end">
                                <button
                                    onClick={handleOneClickPaper}
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto py-5 px-8 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-[1rem] text-lg font-bold transition-all shadow-xl shadow-cyan-600/20 whitespace-nowrap outline-none focus:ring-4 focus:ring-cyan-500/30"
                                >
                                    {isSubmitting ? 'Connecting...' : 'Start 1-Click Paper Trading'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Option B: Connect Exchange Testnet */}
                    <div className="border border-black/10 dark:border-white/10 rounded-[1.5rem] overflow-hidden bg-white/30 dark:bg-white/5">
                        <details className="group list-none marker:hidden">
                            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors [&::-webkit-details-marker]:hidden">
                                <div className="text-left">
                                    <h4 className="text-xl font-bold text-foreground">Connect Exchange Testnet</h4>
                                    <p className="text-foreground/60 text-sm mt-1">Already have a Binance or Bybit Testnet account? Connect your simulated exchange API keys here to test our exact execution latency.</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-foreground/50 group-open:rotate-180 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </summary>
                            <div className="p-6 md:p-8 border-t border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-left">
                                <form onSubmit={handleTestnetSubmit} autoComplete="off" className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                    <input type="hidden" name="userId" value={userId} />

                                    <div className="space-y-3 relative z-10 md:col-span-1">
                                        <label className="text-sm font-semibold text-foreground/60 w-full text-left inline-block">Exchange</label>
                                        <select
                                            name="exchange"
                                            title="Select Exchange"
                                            aria-label="Select Exchange"
                                            className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[1rem] px-5 py-4 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-md"
                                        >
                                            <option value="BINANCE">Binance Testnet</option>
                                            <option value="BYBIT">Bybit Testnet</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3 relative z-10 md:col-span-1">
                                        <label className="text-sm font-semibold text-foreground/60 w-full text-left inline-block">API Key</label>
                                        <input
                                            type="text"
                                            name="apiKey"
                                            required
                                            autoComplete="off"
                                            spellCheck="false"
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                            className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[1rem] px-5 py-4 text-foreground font-medium placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-md"
                                            placeholder="Testnet Key..."
                                        />
                                    </div>

                                    <div className="space-y-3 relative z-10 md:col-span-1">
                                        <label className="text-sm font-semibold text-foreground/60 w-full text-left inline-block">API Secret</label>
                                        <input
                                            type="text"
                                            name="apiSecret"
                                            required
                                            autoComplete="off"
                                            spellCheck="false"
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                            style={{ WebkitTextSecurity: 'disc' } as any}
                                            className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[1rem] px-5 py-4 text-foreground font-medium placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-md"
                                            placeholder="Testnet Secret..."
                                        />
                                    </div>

                                    <div className="md:col-span-1 mb-[0.125rem]">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 px-6 bg-black dark:bg-[#1D1D1F] hover:opacity-90 disabled:opacity-50 text-white rounded-[1rem] text-sm font-bold transition-all shadow-md outline-none"
                                        >
                                            {isSubmitting ? 'Connecting...' : 'Connect Testnet'}
                                        </button>
                                    </div>
                                    
                                    <div className="md:col-span-4 mt-2">
                                        <a href="#" className="text-sm text-foreground/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:underline w-full text-left">
                                            Need help? Read our guide on how to create a Binance Testnet account
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </details>
                    </div>

                </div>
            ) : (
                <form onSubmit={handleSubmit} autoComplete="off" className="relative z-10 fade-in animate-in">
                    <fieldset className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end text-left">
                    <input type="hidden" name="userId" value={userId} />

                    <div className="space-y-3 relative z-10 md:col-span-1">
                        <label className="text-sm font-semibold text-foreground/60 w-full text-left inline-block">Exchange</label>
                        <select
                            name="exchange"
                            title="Select Exchange"
                            aria-label="Select Exchange"
                            className="w-full bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1rem] px-5 py-4 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-md"
                        >
                            <option value="BINANCE">Binance</option>
                            <option value="BYBIT">Bybit</option>
                            <option value="OKX">OKX</option>
                            <option value="MEXC">MEXC</option>
                            <option value="GATEIO">Gate.io</option>
                            <option value="COINBASE">Coinbase Advanced</option>
                            <option value="KRAKEN">Kraken</option>
                            <option value="UNISWAP">Uniswap v3</option>
                            <option value="HYPERLIQUID">Hyperliquid</option>
                        </select>
                    </div>

                    <div className="space-y-3 relative z-10 md:col-span-1">
                        <label className="text-sm font-semibold text-foreground/60 w-full text-left inline-block">API Key</label>
                        <input
                            type="text"
                            name="apiKey"
                            required
                            autoComplete="off"
                            spellCheck="false"
                            data-lpignore="true"
                            data-1p-ignore="true"
                            className="w-full bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1rem] px-5 py-4 text-foreground font-medium placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-md"
                            placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t..."
                        />
                    </div>

                    <div className="space-y-3 relative z-10 md:col-span-1">
                        <label className="text-sm font-semibold text-foreground/60 w-full text-left inline-block">API Secret</label>
                        <input
                            type="text"
                            name="apiSecret"
                            required
                            autoComplete="off"
                            spellCheck="false"
                            data-lpignore="true"
                            data-1p-ignore="true"
                            style={{ WebkitTextSecurity: 'disc' } as any}
                            className="w-full bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1rem] px-5 py-4 text-foreground font-medium placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-md"
                            placeholder="e.g. z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0..."
                        />
                    </div>

                    <div className="md:col-span-4 mt-6">

                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-[1rem] p-5 mb-6 text-left">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 mb-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                Crucial API Key Requirements
                            </h4>
                            <ul className="text-xs text-foreground/70 space-y-1 ml-4 list-disc marker:text-orange-500/50">
                                <li>Ensure your API keys have <strong>Trade/Execution Permissions</strong> enabled.</li>
                                <li>Ensure <strong>Withdrawal Permissions</strong> are strictly <strong>DISABLED</strong>. AutoAlpha will never ask for withdrawal access.</li>
                                <li>You are 100% responsible for the safekeeping of these keys on your end. AutoAlpha encrypts them securely on our end.</li>
                            </ul>
                        </div>

                        <div className="flex items-start gap-3 mb-6 text-left">
                            <input
                                type="checkbox"
                                id="apiTermsCheckbox"
                                className="mt-1 w-4 h-4 rounded border-black/10 dark:border-white/10 text-cyan-600 focus:ring-cyan-500/50 shrink-0"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                required
                            />
                            <label htmlFor="apiTermsCheckbox" className="text-xs text-foreground/70 leading-relaxed cursor-pointer select-none">
                                I confirm that my API keys DO NOT possess withdrawal capabilities. I understand that I am linking my exchange to automated third-party strategies, which involves extreme risk and potential loss of my entire portfolio balance.
                            </label>
                        </div>

                        <button
                            type="submit"
                            title="Save and Encrypt Key"
                            aria-label="Save and Encrypt Key"
                            disabled={isSubmitting}
                            className="w-full py-4 px-6 bg-black dark:bg-[#1D1D1F] hover:opacity-90 disabled:opacity-50 text-white rounded-[1rem] text-lg font-semibold transition-all shadow-xl shadow-black/10"
                        >
                            {isSubmitting ? 'Securing Key...' : 'Save & Encrypt Key'}
                        </button>
                    </div>
                    </fieldset>
                </form>
            )}

            {activeKeys.length > 0 && (
                <div className="mt-10 border-t border-black/5 dark:border-white/10 pt-8 relative z-10">
                    <h3 className="text-lg font-bold text-foreground mb-4 text-left">Active Connections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeKeys.map((key) => (
                            <div key={key.id} className="p-5 rounded-[1.2rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex justify-between items-center transition-all hover:bg-black/10 dark:hover:bg-white/10">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    <span className="font-bold text-foreground tracking-tight">
                                        {key.exchange === 'BINANCE' && key.isTestnet ? 'AutoAlpha Simulated Paper Trading' : key.exchange}
                                    </span>
                                    {key.isTestnet && (
                                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase tracking-wider">Sandbox</span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-semibold text-foreground/40">Secured</span>
                                    <button
                                        onClick={() => handleDelete(key.id)}
                                        className="text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                        title="Delete Connection"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
