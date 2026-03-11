"use client";

import { useState, useTransition } from "react";
import { saveApiKey, deleteApiKey } from "./actions";
import { ExchangeKey } from "@prisma/client";

interface ApiKeyFormProps {
    userId: string;
    existingKeys: ExchangeKey[];
}

export default function ApiKeyForm({ userId, existingKeys }: ApiKeyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.currentTarget;
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

    const handleDelete = (keyId: string) => {
        if (!confirm('Are you sure you want to delete this API Key? Any active strategies using this key will fail to execute.')) return;
        startTransition(async () => {
            try {
                await deleteApiKey(keyId);
            } catch (error) {
                console.error(error);
                alert("Failed to delete key.");
            }
        });
    };

    return (
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 mb-8 border border-black/5 dark:border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
            <h2 className="text-2xl font-bold text-foreground mb-8 tracking-tight relative z-10">Connect Exchange</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <input type="hidden" name="userId" value={userId} />

                <div className="space-y-3 relative z-10">
                    <label className="text-sm font-semibold text-foreground/60">Exchange</label>
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

                <div className="space-y-3 relative z-10">
                    <label className="text-sm font-semibold text-foreground/60">API Key</label>
                    <input
                        type="text"
                        name="apiKey"
                        required
                        className="w-full bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1rem] px-5 py-4 text-foreground font-medium placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-md"
                        placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t..."
                    />
                </div>

                <div className="space-y-3 relative z-10">
                    <label className="text-sm font-semibold text-foreground/60">API Secret</label>
                    <input
                        type="password"
                        name="apiSecret"
                        required
                        className="w-full bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1rem] px-5 py-4 text-foreground font-medium placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all backdrop-blur-md"
                        placeholder="e.g. z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0..."
                    />
                </div>



                <div className="md:col-span-4 mt-6">
                    <button
                        type="submit"
                        title="Save and Encrypt Key"
                        aria-label="Save and Encrypt Key"
                        disabled={isSubmitting}
                        className="w-full py-4 px-6 bg-[#1D1D1F] hover:bg-black disabled:opacity-50 text-white rounded-[1rem] text-lg font-semibold transition-all shadow-xl shadow-black/10"
                    >
                        {isSubmitting ? 'Securing Key...' : 'Save & Encrypt Key'}
                    </button>
                </div>
            </form>

            {existingKeys.filter(k => k.isValid).length > 0 && (
                <div className="mt-10 border-t border-black/5 pt-8">
                    <h3 className="text-lg font-bold text-[#1D1D1F] mb-4">Active Connections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {existingKeys.filter(k => k.isValid).map((key) => (
                            <div key={key.id} className="p-5 rounded-[1.2rem] bg-[#F5F5F7]/80 border border-black/5 flex justify-between items-center transition-all hover:bg-[#F5F5F7]">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    <span className="font-bold text-[#1D1D1F] tracking-tight">{key.exchange}</span>
                                    {key.isTestnet && (
                                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider">Testnet</span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-semibold text-black/40">Secured</span>
                                    <button
                                        onClick={() => handleDelete(key.id)}
                                        className="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
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
