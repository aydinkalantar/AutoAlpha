'use client';

import { useState } from 'react';
import { updateMarketingConfig } from './actions';
import { Mail, Gift, Megaphone, Loader2 } from 'lucide-react';
import { SystemConfig } from '@prisma/client';

export default function MarketingForm({ config }: { config: SystemConfig | null }) {
    const [welcomeBonusEnabled, setWelcomeBonusEnabled] = useState(config?.welcomeBonusEnabled || false);
    const [welcomeBonusAmount, setWelcomeBonusAmount] = useState(config?.welcomeBonusAmount || 50);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        formData.set('welcomeBonusEnabled', welcomeBonusEnabled.toString());
        formData.set('welcomeBonusAmount', welcomeBonusAmount.toString());

        try {
            await updateMarketingConfig(formData);
            setMessage({ type: 'success', text: 'Marketing configurations updated successfully.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save configuration.' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Promotional Campaigns Block */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/20">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5 dark:border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Active Campaigns</h2>
                        <p className="text-foreground/60">Configure promotional incentives for user acquisition.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">Welcome Bonus Mode</h3>
                            <p className="text-sm text-foreground/60 w-3/4">Automatically credit new users with promotional Gas Tank funds upon registration. The system guarantees that these funds can only be spent on performance fees.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={welcomeBonusEnabled}
                                onChange={(e) => setWelcomeBonusEnabled(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-black/20 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    <div className={welcomeBonusEnabled ? "opacity-100 transition-opacity" : "opacity-30 pointer-events-none transition-opacity"}>
                        <label className="block text-sm font-semibold mb-2 ml-1">Bonus Amount ($ USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 font-bold">$</span>
                            <input
                                type="number"
                                name="welcomeBonusAmount"
                                value={welcomeBonusAmount}
                                onChange={(e) => setWelcomeBonusAmount(parseFloat(e.target.value))}
                                className="w-full bg-white/50 dark:bg-black/20 border justify-center border-black/10 dark:border-white/10 rounded-2xl px-10 py-4 font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-foreground/30"
                                placeholder="50.00"
                                step="0.01"
                                min="0" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Marketing Block (Future Expansion) */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/20 opacity-70">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5 dark:border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">Email Marketing</h2>
                            <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-black/10 dark:bg-white/10 text-foreground/70 rounded-full">Coming Soon</span>
                        </div>
                        <p className="text-foreground/60">Broadcast newsletters and promotional sequences to all registered investors.</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Megaphone className="w-12 h-12 text-foreground/20 mb-4" />
                    <p className="text-foreground/50 font-medium">Bulk email broadcast capabilities will be unlocked in a future sprint.</p>
                </div>
            </div>

            {/* Notification / Submit */}
            <div className="flex items-center justify-between pt-6">
                <div className="flex-1">
                    {message && (
                        <p className={message.type === 'success' ? "text-emerald-500 font-medium ml-4" : "text-red-500 font-medium ml-4"}>
                            {message.text}
                        </p>
                    )}
                </div>
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-foreground text-background font-bold py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all shadow-xl shadow-black/10 dark:shadow-white/5"
                >
                    {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isSaving ? 'Saving Configurations...' : 'Save Marketing Strategy'}
                </button>
            </div>
        </form>
    );
}
