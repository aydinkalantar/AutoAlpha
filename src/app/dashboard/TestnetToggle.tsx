"use client";

import { useTransition } from "react";
import { toggleTestnetMode, resetPaperCapital } from "./actions";
import { RotateCw } from "lucide-react";

export default function TestnetToggle({ initialMode, userId }: { initialMode: boolean, userId: string }) {
    const [isPending, startTransition] = useTransition();
    const [isResetting, startReset] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleTestnetMode(userId, !initialMode);
        });
    };

    const handleReset = () => {
        if (!confirm("Are you sure you want to reset your paper balance to default ($10k USDT / $10k USDC)? This will forcefully pause open paper trades.")) return;
        startReset(async () => {
            await resetPaperCapital(userId);
        });
    };

    return (
        <div className="flex items-center gap-3 md:gap-4 bg-white/60 dark:bg-[#111] backdrop-blur-2xl px-4 md:px-6 py-2.5 md:py-3 rounded-full border border-black/5 dark:border-white/10 shadow-sm w-fit relative z-10 transition-all max-w-[100vw]">
            <span className={`text-sm tracking-tight transition-colors duration-300 font-bold ${!initialMode ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40'}`}>
                Live
            </span>

            <button
                onClick={handleToggle}
                disabled={isPending || isResetting}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${initialMode ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-black/20 dark:bg-white/20'}`}
                title="Toggle Execution Mode"
            >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${initialMode ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>

            <div className="flex items-center gap-2">
                <span className={`text-sm tracking-tight transition-colors duration-300 font-bold ${initialMode ? 'text-cyan-600 dark:text-cyan-400' : 'text-black/40 dark:text-white/40'}`}>
                    Sandbox
                </span>
                {initialMode && (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                )}
            </div>

            {/* Paper Reset Button Container - Fixed width prevents layout shift on desktop, collapses on mobile when inactive */}
            <div className={`flex justify-end transition-all duration-300 overflow-hidden ${initialMode ? 'w-28 md:w-32 opacity-100' : 'w-0 md:w-32 md:opacity-100 opacity-0'}`}>
                {initialMode && (
                    <div className="pl-3 md:pl-4 ml-2 border-l border-black/10 dark:border-white/10 flex-1 flex justify-end">
                        <button
                            onClick={handleReset}
                            disabled={isResetting || isPending}
                            className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-foreground/50 hover:text-cyan-500 transition-colors disabled:opacity-50 whitespace-nowrap"
                            title="Reset Paper Capital to default ($20k)"
                        >
                            <RotateCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                            <span>Reset Funds</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
