'use client';

import React, { useState } from 'react';
import { sendBroadcastEmail } from './actions';
import { Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BroadcastForm() {
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSending(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const subject = formData.get('subject') as string;
        const body = formData.get('body') as string;
        const audience = formData.get('audience') as string;

        if (!subject || !body || !audience) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            setIsSending(false);
            return;
        }

        try {
            const result = await sendBroadcastEmail({ subject, body, audience });
            if (result.success) {
                setMessage({ type: 'success', text: `Broadcast successfully sent to ${result.count} users.` });
                e.currentTarget.reset();
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to send broadcast.' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/20 relative z-10">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Compose Broadcast</h2>
            
            {message && (
                <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                    <p className="font-medium text-sm">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-foreground/80">Target Audience</label>
                    <div className="relative">
                        <select 
                            name="audience" 
                            disabled={isSending}
                            className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-4 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                            required
                        >
                            <option value="" disabled selected>Select an audience segment...</option>
                            <option value="all">All Users</option>
                            <option value="active">Active Investors (Has API Connected)</option>
                            <option value="pending">Pending Users (No API Connected)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-foreground/50">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-foreground/80">Subject Line</label>
                    <input
                        type="text"
                        name="subject"
                        disabled={isSending}
                        required
                        className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-foreground/30 disabled:opacity-50"
                        placeholder="E.g. Action Required: Update Your API Keys"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-foreground/80">Email Body (HTML Supported)</label>
                    <textarea
                        name="body"
                        rows={8}
                        disabled={isSending}
                        required
                        className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-foreground/30 resize-y disabled:opacity-50"
                        placeholder="Type your email content here... HTML tags like <b>, <i>, <br>, <a> are supported."
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isSending}
                        className="flex items-center gap-2 bg-foreground text-background font-bold py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all shadow-xl shadow-black/10 dark:shadow-white/5"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        {isSending ? 'Sending Broadcast...' : 'Send Broadcast'}
                    </button>
                </div>
            </form>
        </div>
    );
}
