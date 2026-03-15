"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, CheckCircle2, FlaskConical, Target, Rocket } from "lucide-react";
import { completeOnboarding } from "./actions";

interface WelcomeModalProps {
    userId: string;
    hasCompletedOnboarding: boolean;
}

export default function WelcomeModal({ userId, hasCompletedOnboarding }: WelcomeModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        // Hydration safety + Check if they need onboarding
        if (!hasCompletedOnboarding) {
            setIsOpen(true);
        }
    }, [hasCompletedOnboarding]);

    const handleComplete = () => {
        startTransition(async () => {
            await completeOnboarding(userId);
            setIsOpen(false);
        });
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else handleComplete();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => {
            // Prevent closing by clicking outside until they complete it
            if (!open && !isPending) {
                // Do nothing
            }
        }}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-white/20 shadow-2xl rounded-3xl" showCloseButton={false}>
                <DialogTitle className="sr-only">Welcome to AutoAlpha</DialogTitle>
                
                {/* Progress Bar */}
                <div className="flex h-1 bg-black/5 dark:bg-white/5">
                    <div 
                        className="h-full bg-cyan-500 transition-all duration-500 ease-out" 
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8 pb-6">
                    {/* Step 1: Welcome / Concept */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                                <Rocket className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome to AutoAlpha.</h2>
                            <p className="text-foreground/60 leading-relaxed text-sm">
                                You are now inside a professional-grade algorithmic trading terminal. AutoAlpha connects your capital directly to high-frequency quantitative strategies. No manual trading required.
                            </p>
                        </div>
                    )}

                    {/* Step 2: Paper Sandbox */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
                                <FlaskConical className="w-6 h-6 text-cyan-500" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">The $20k Sandbox.</h2>
                            <p className="text-foreground/60 leading-relaxed text-sm">
                                We've credited your account with <strong>$10,000 Paper USDT</strong> and <strong>$10,000 Paper USDC</strong>. Look for the "Sandbox" toggle on your dashboard. Use this safe environment to test strategies risk-free before connecting real API keys.
                            </p>
                        </div>
                    )}

                    {/* Step 3: Allocation */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                                <Target className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">Allocate and Deploy.</h2>
                            <p className="text-foreground/60 leading-relaxed text-sm">
                                Explore the <strong>Strategy Marketplace</strong> below. When you find an algorithm you like, simply allocate Capital to it. The system will automatically execute all trades on your behalf.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 pt-0 flex justify-between items-center bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 mt-auto">
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map((i) => (
                            <div 
                                key={i} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-4 bg-cyan-500' : 'w-1.5 bg-black/10 dark:bg-white/10'}`}
                            />
                        ))}
                    </div>
                    
                    <button
                        onClick={nextStep}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {step === 3 ? (
                            <>
                                {isPending ? 'Entering...' : 'Enter Dashboard'}
                                <CheckCircle2 className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
