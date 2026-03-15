"use client";

import { useTransition, useState } from 'react';
import { updateSystemConfig, wipeSandboxData } from './actions';
import { SystemConfig } from '@prisma/client';
import { Save, AlertTriangle } from 'lucide-react';

export default function SettingsForm({ config }: { config: SystemConfig | null }) {
    config = config || ({ stripeMode: 'TEST' } as SystemConfig);
    const [isPending, startTransition] = useTransition();
    const [mode, setMode] = useState(config.stripeMode);
    const [saved, setSaved] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const result = await updateSystemConfig(formData);
                if (result?.error) {
                    alert("Failed to save settings: " + result.error);
                    return;
                }
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } catch (err: any) {
                alert("An unexpected error occurred while saving: " + err.message);
            }
        });
    };

    return (
        <div className="space-y-12">
            <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] shadow-2xl p-8 shadow-black-[0.03] dark:shadow-white/5 space-y-8 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-foreground">Stripe Integration</h2>
                    <p className="text-foreground/50 text-sm mt-1 font-medium">Connect your billing API keys to process fiat subscriptions.</p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div className="text-sm font-medium text-orange-800 dark:text-orange-300">
                        These Database keys will override your \`.env\` file. If they are left empty, the system will attempt to fallback to the existing \`.env\` string.
                    </div>
                </div>


                <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground/60 px-2 uppercase tracking-wider">Execution Environment</label>
                    <select
                        name="stripeMode"
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-bold appearance-none"
                    >
                        <option value="TEST">TEST MODE (Sandbox)</option>
                        <option value="LIVE">LIVE MODE (Production)</option>
                    </select>
                </div>

                {/* TEST KEYS */}
                <div className={`space-y-6 pt-6 border-t border-black/5 dark:border-white/10 transition-opacity ${mode === 'TEST' ? 'opacity-100' : 'opacity-40'}`}>
                    <h3 className="text-lg font-bold text-foreground">Test Mode Keys</h3>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground/60 px-2">Stripe Publishable Key (Test)</label>
                        <input
                            type="text"
                            name="stripeTestPublicKey"
                            defaultValue={config.stripeTestPublicKey || ''}
                            placeholder="pk_test_..."
                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground placeholder-foreground/30 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground/60 px-2">Stripe Secret Key (Test)</label>
                        <input
                            type="password"
                            name="stripeTestSecretKey"
                            defaultValue={config.stripeTestSecretKey || ''}
                            placeholder="sk_test_..."
                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground placeholder-foreground/30 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground/60 px-2">Stripe Webhook Secret (Test)</label>
                        <input
                            type="password"
                            name="stripeTestWebhookSecret"
                            defaultValue={config.stripeTestWebhookSecret || ''}
                            placeholder="whsec_..."
                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground placeholder-foreground/30 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-mono text-sm"
                        />
                    </div>
                </div>

                {/* LIVE KEYS */}
                <div className={`space-y-6 pt-6 border-t border-black/5 dark:border-white/10 transition-opacity ${mode === 'LIVE' ? 'opacity-100' : 'opacity-40'}`}>
                    <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                        Live Mode Keys
                        <span className="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Danger</span>
                    </h3>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground/60 px-2">Stripe Publishable Key (Live)</label>
                        <input
                            type="text"
                            name="stripeLivePublicKey"
                            defaultValue={config.stripeLivePublicKey || ''}
                            placeholder="pk_live_..."
                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground placeholder-foreground/30 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground/60 px-2">Stripe Secret Key (Live)</label>
                        <input
                            type="password"
                            name="stripeLiveSecretKey"
                            defaultValue={config.stripeLiveSecretKey || ''}
                            placeholder="sk_live_..."
                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground placeholder-foreground/30 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground/60 px-2">Stripe Webhook Secret (Live)</label>
                        <input
                            type="password"
                            name="stripeLiveWebhookSecret"
                            defaultValue={config.stripeLiveWebhookSecret || ''}
                            placeholder="whsec_..."
                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground placeholder-foreground/30 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-mono text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 items-center">
                {saved && (
                    <span className="text-green-600 font-bold text-sm tracking-tight animate-pulse">
                        Configuration saved securely.
                    </span>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-full hover:bg-foreground/80 transition-all font-bold disabled:opacity-50 shadow-xl shadow-black-[0.05] dark:shadow-white/5"
                >
                    <Save className="w-5 h-5" />
                    <span>{isPending ? 'Saving...' : 'Save Configuration'}</span>
                </button>
            </div>
            </form>

            <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[2rem] p-8 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                        Danger Zone: Sandbox Simulator
                        <AlertTriangle className="w-5 h-5" />
                    </h2>
                    <p className="text-red-600/70 text-sm mt-1 font-medium">
                        Instantly permanently delete all Sandbox Trades, Positions, and simulated Ledgers. This action cannot be undone, but will not affect Live Capital revenue.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (confirm('Are you absolutely sure you want to permanently delete all Sandbox simulation data?')) {
                            startTransition(async () => {
                                await wipeSandboxData();
                                alert('Sandbox data wiped successfully.');
                            });
                        }
                    }}
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold disabled:opacity-50"
                >
                    <AlertTriangle className="w-4 h-4" />
                    {isPending ? 'Processing...' : 'Wipe All Sandbox Data'}
                </button>
            </div>
        </div>
    );
}
