'use client';

import { useState } from 'react';
import { updateZombieCampaignConfig } from './actions';
import { Bot, Loader2 } from 'lucide-react';
import { SystemConfig } from '@prisma/client';

export default function ZombieCampaignForm({ 
    config, 
    emailsSentCount 
}: { 
    config: SystemConfig | null, 
    emailsSentCount: number 
}) {
    const [zombieCampaignEnabled, setZombieCampaignEnabled] = useState(config?.zombieCampaignEnabled || false);
    const [zombieTriggerDays, setZombieTriggerDays] = useState(config?.zombieTriggerDays || 3);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('zombieCampaignEnabled', zombieCampaignEnabled.toString());
        formData.append('zombieTriggerDays', zombieTriggerDays.toString());

        try {
            await updateZombieCampaignConfig(formData);
            setMessage({ type: 'success', text: 'Automations updated successfully.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save configuration.' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/20">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5 dark:border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Automated API Reminder (Zombie Campaign)</h2>
                        <p className="text-foreground/60">Automatically email users who signed up but haven't connected an exchange API.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-6 border border-black/5 dark:border-white/5 flex flex-col justify-center items-center text-center">
                            <span className="text-sm font-medium text-foreground/50 uppercase tracking-wider mb-2">Total Emails Sent</span>
                            <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
                                {emailsSentCount.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">Enable Campaign</h3>
                            <p className="text-sm text-foreground/60 w-3/4">Turn on the automated drip campaign. The CRON job will run daily to check for pending users.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={zombieCampaignEnabled}
                                onChange={(e) => setZombieCampaignEnabled(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-black/20 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>

                    <div className={zombieCampaignEnabled ? "opacity-100 transition-opacity" : "opacity-30 pointer-events-none transition-opacity"}>
                        <label className="block text-sm font-semibold mb-2 ml-1">Trigger After X Days</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="zombieTriggerDays"
                                value={zombieTriggerDays}
                                onChange={(e) => setZombieTriggerDays(parseInt(e.target.value))}
                                className="w-full bg-white/50 dark:bg-black/20 border justify-center border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-foreground/30"
                                placeholder="3"
                                min="1" 
                            />
                        </div>
                        <p className="text-sm text-foreground/50 mt-2 ml-1">
                            Users who created their account more than {zombieTriggerDays} days ago and haven't connected an API key will receive the email.
                        </p>
                    </div>
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
                    {isSaving ? 'Saving Configurations...' : 'Save Automation Strategy'}
                </button>
            </div>
        </form>
    );
}
