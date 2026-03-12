"use client";

import React, { useState } from 'react';
import { updateAutoDepositSettings } from './autoDepositActions';
import { Settings, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AutoDepositSettingsProps {
    autoDepositEnabled: boolean;
    autoDepositThreshold: number;
    autoDepositAmount: number;
    hasStripeCustomer: boolean;
}

export default function AutoDepositSettings({
    autoDepositEnabled: initialEnabled,
    autoDepositThreshold: initialThreshold,
    autoDepositAmount: initialAmount,
    hasStripeCustomer
}: AutoDepositSettingsProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [threshold, setThreshold] = useState(initialThreshold);
    const [amount, setAmount] = useState(initialAmount);
    
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const hasChanged = enabled !== initialEnabled || 
                       threshold !== initialThreshold || 
                       amount !== initialAmount;

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setSuccess(false);

        try {
            await updateAutoDepositSettings(enabled, threshold, amount);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to update settings");
            // Revert on error
            setEnabled(initialEnabled);
            setThreshold(initialThreshold);
            setAmount(initialAmount);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#1C1C1E] dark:bg-black/50 backdrop-blur-3xl rounded-[2rem] border-2 border-white/5 p-8 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-cyan-500/20" />

            <div className="relative z-10 flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                        <Settings className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight text-white">Auto-Refill Configurator</h3>
                        <p className="text-sm font-medium text-white/50 mt-1">Sustain your edge without interruption.</p>
                    </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        title="Toggle Auto-Refill"
                        aria-label="Toggle Auto-Refill"
                        className="sr-only peer" 
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        disabled={isSaving}
                    />
                    <div className="w-14 h-8 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500 hover:bg-white/20"></div>
                </label>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-rose-400">{error}</p>
                </div>
            )}

            {!hasStripeCustomer && enabled && !error && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-amber-400">
                        You must complete at least one manual deposit first to authorize a payment method for auto-refill.
                    </p>
                </div>
            )}

            <div className={`space-y-6 transition-opacity duration-300 ${!enabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                
                {/* Trigger Threshold */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-black/40 rounded-2xl border border-white/5">
                    <div>
                        <p className="font-bold text-white tracking-wide">Trigger Threshold</p>
                        <p className="text-xs font-semibold text-white/40 mt-1">Activate when Gas drops below</p>
                    </div>
                    <div className="relative group/input">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                        <input 
                            type="number"
                            title="Trigger Threshold Amount"
                            min="5"
                            max="500"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            className="w-32 bg-white/5 border-2 border-transparent group-hover/input:border-white/10 rounded-xl py-3 pl-8 pr-4 text-right font-black text-white focus:outline-none focus:border-cyan-500/50 transition-all text-lg"
                        />
                    </div>
                </div>

                {/* Refill Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-black/40 rounded-2xl border border-white/5">
                    <div>
                        <p className="font-bold text-white tracking-wide">Refill Execution</p>
                        <p className="text-xs font-semibold text-white/40 mt-1">Volume to purchase</p>
                    </div>
                    <div className="relative group/input">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                        <input 
                            type="number"
                            title="Auto-Refill Amount"
                            min="10"
                            max="500"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-32 bg-white/5 border-2 border-transparent group-hover/input:border-white/10 rounded-xl py-3 pl-8 pr-4 text-right font-black text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all text-lg"
                        />
                    </div>
                </div>
            </div>

            {hasChanged && (
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || (enabled && !hasStripeCustomer)}
                        className="flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 text-black disabled:text-white/40 font-black tracking-wide rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Synchronizing...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Secured
                            </>
                        ) : (
                            'Save Configuration'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
