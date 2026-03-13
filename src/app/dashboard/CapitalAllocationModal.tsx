"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface CapitalAllocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    strategy: { id: string; name: string };
    totalMasterBalance: number;
    currentAllocation: number;
    onSave: (amount: number) => Promise<void>;
    onRemove?: () => Promise<void>;
}

export default function CapitalAllocationModal({
    isOpen,
    onClose,
    strategy,
    totalMasterBalance,
    currentAllocation,
    onSave,
    onRemove
}: CapitalAllocationModalProps) {
    const [allocationAmount, setAllocationAmount] = useState(currentAllocation);
    const [isSaving, setIsSaving] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    // Sync state when opened
    useEffect(() => {
        if (isOpen) {
            setAllocationAmount(currentAllocation);
        }
    }, [isOpen, currentAllocation]);

    if (!isOpen) return null;

    const unallocatedCash = totalMasterBalance - allocationAmount;
    const hasChanged = allocationAmount !== currentAllocation;

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllocationAmount(Number(e.target.value));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;

        // Strict Validation
        if (val > totalMasterBalance) val = totalMasterBalance;
        if (val < 0) val = 0;

        setAllocationAmount(val);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(allocationAmount);
        } catch (error) {
            console.error("Failed to save allocation", error);
        } finally {
            setIsSaving(false);
            onClose(); // Optional: Usually you want to close after saving
        }
    };

    const handleRemove = async () => {
        if (!onRemove) return;
        setIsRemoving(true);
        try {
            await onRemove();
        } catch (error) {
            console.error("Failed to remove subscription", error);
        } finally {
            setIsRemoving(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:pl-64 bg-black/50 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-black/5 dark:border-white/10 relative transform transition-all duration-300 scale-100 opacity-100">

                {/* Header */}
                <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        Manage Capital: {strategy.name}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        title="Close Capital Modal"
                        className="text-foreground/50 hover:text-foreground transition-colors p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pt-4 pb-2">
                    <p className="text-sm font-semibold text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                        Allocation changes will apply to the next new trade signal.
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Visual Feedback Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-cyan-500/10 dark:bg-cyan-500/20 rounded-xl p-5 border border-cyan-500/20 flex flex-col justify-center">
                            <p className="text-xs font-bold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 mb-2">
                                Allocated to Strategy
                            </p>
                            <p className="text-3xl font-black text-cyan-700 dark:text-cyan-300 tracking-tight">
                                ${allocationAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-gray-100/80 dark:bg-white/5 rounded-xl p-5 border border-black/5 dark:border-white/10 flex flex-col justify-center shadow-sm">
                            <p className="text-xs font-bold tracking-wider uppercase text-foreground/50 mb-2">
                                Remaining Idle Cash
                            </p>
                            <p className="text-3xl font-black text-foreground/70 tracking-tight">
                                ${unallocatedCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Dual Controls */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-semibold text-foreground/80">
                                Allocation Amount (USD)
                            </label>
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 font-bold">$</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={totalMasterBalance}
                                    value={allocationAmount === 0 ? "" : allocationAmount} // Better UX for typing 0
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                    className="w-40 bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-xl py-3 pl-8 pr-4 text-right font-black text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-sm"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pb-2">
                            <input
                                type="range"
                                title="Allocation Slider"
                                aria-label="Allocation Slider"
                                min={0}
                                max={totalMasterBalance}
                                step={1} // Assuming they allocate in increments of $1
                                value={allocationAmount}
                                onChange={handleSliderChange}
                                disabled={isSaving}
                                className="w-full h-2.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                            <div className="flex justify-between items-center text-xs font-semibold text-foreground/40">
                                <span>$0</span>
                                <span>${totalMasterBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Max</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-black/5 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {onRemove ? (
                        <div className="w-full sm:w-auto">
                            {!showRemoveConfirm ? (
                                <button
                                    onClick={() => setShowRemoveConfirm(true)}
                                    disabled={isSaving || isRemoving}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 rounded-xl font-bold transition-all w-full sm:w-auto"
                                    title="Disconnect API completely"
                                >
                                    Disconnect Strategy
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleRemove}
                                        disabled={isRemoving}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 text-white hover:bg-rose-600 rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all w-full sm:w-auto"
                                    >
                                        {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Disconnect'}
                                    </button>
                                    <button
                                        onClick={() => setShowRemoveConfirm(false)}
                                        disabled={isRemoving}
                                        className="px-3 py-2.5 text-sm font-bold text-foreground/50 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            disabled={isSaving || isRemoving}
                            className="px-5 py-2.5 text-sm font-bold tracking-wide text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanged || isSaving || isRemoving || showRemoveConfirm}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-gray-300 disabled:to-gray-200 dark:disabled:from-white/10 dark:disabled:to-white/5 disabled:text-foreground/40 text-white text-md font-bold tracking-wide rounded-xl shadow-lg shadow-cyan-500/20 disabled:shadow-none transition-all w-full sm:w-auto"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Confirm Allocation'
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
