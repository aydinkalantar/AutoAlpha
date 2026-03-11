"use client";

import { useTransition } from "react";
import { toggleTestnetMode } from "./actions";

export default function TestnetToggle({ initialMode, userId }: { initialMode: boolean, userId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleTestnetMode(userId, !initialMode);
        });
    };

    return (
        <div className="flex items-center gap-4 bg-white/60 dark:bg-[#111] backdrop-blur-2xl px-6 py-3 rounded-full border border-black/5 dark:border-white/10 shadow-sm w-fit relative z-10 transition-all">
            <span className={`text-sm tracking-tight transition-colors duration-300 font-bold ${!initialMode ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40'}`}>
                Live Capital
            </span>

            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${initialMode ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-black/20 dark:bg-white/20'}`}
                title="Toggle Execution Mode"
            >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${initialMode ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>

            <div className="flex items-center gap-2">
                <span className={`text-sm tracking-tight transition-colors duration-300 font-bold ${initialMode ? 'text-cyan-600 dark:text-cyan-400' : 'text-black/40 dark:text-white/40'}`}>
                    Testnet Sandbox
                </span>
                {initialMode && (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                )}
            </div>
        </div>
    );
}
