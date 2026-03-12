"use client";

import { useState } from 'react';
import { adjustBalance } from './actions';

interface CreditDebitModalProps {
    userId: string;
    email: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function CreditDebitModal({ userId, email, isOpen, onClose }: CreditDebitModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            formData.append('userId', userId);
            await adjustBalance(formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to adjust balance.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/10 backdrop-blur-md transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-white/80 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden z-10 transition-all">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Adjust Balance</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F5F5F7] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors" disabled={isSubmitting} title="Close modal" aria-label="Close modal">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-sm font-medium text-foreground/50 bg-[#F5F5F7] dark:bg-white/5 px-4 py-3 rounded-[1rem]">
                        Adjusting for: <span className="font-bold text-foreground ml-1">{email}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-foreground/60 px-2">Action Type</label>
                            <select
                                name="type"
                                title="Action Type"
                                className="w-full bg-[#F5F5F7] dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-bold appearance-none"
                            >
                                <option value="CREDIT">Credit (+)</option>
                                <option value="DEBIT">Debit (-)</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-foreground/60 px-2">Currency</label>
                            <select
                                name="currency"
                                title="Currency"
                                className="w-full bg-[#F5F5F7] dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-bold appearance-none"
                            >
                                <option value="USDT">USDT</option>
                                <option value="USDC">USDC</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground/60 px-2">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            required
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full bg-[#F5F5F7] dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground placeholder-foreground/30 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-mono font-bold text-lg"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground/60 px-2">Ledger Note</label>
                        <textarea
                            name="description"
                            required
                            placeholder="Reason for manual adjustment..."
                            rows={3}
                            className="w-full bg-[#F5F5F7] dark:bg-white/5 border border-transparent rounded-[1.2rem] px-5 py-4 text-foreground placeholder-foreground/30 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-4 bg-foreground hover:bg-foreground/80 disabled:opacity-30 text-background rounded-[1.2rem] text-lg font-bold transition-all shadow-lg shadow-black/10 dark:shadow-white/5"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Adjustment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
