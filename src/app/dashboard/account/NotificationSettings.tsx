"use client";

import { useState } from "react";
import { toggleTradeEmailNotifications } from "./actions";
import { Mail, Loader2 } from "lucide-react";

export default function NotificationSettings({ initialEnabled }: { initialEnabled: boolean }) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        const newState = !enabled;
        // Optimistic UI update
        setEnabled(newState);

        const res = await toggleTradeEmailNotifications(newState);
        if (!res.success) {
            // Revert on failure
            setEnabled(!newState);
            alert("Failed to update notification settings.");
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center justify-between relative z-10 w-full">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-black/5 dark:border-white/10">
                        <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-foreground">Trade Notifications</p>
                        <p className="text-sm font-medium text-foreground/50">Receive an email whenever a strategy executes a trade.</p>
                    </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={enabled}
                        onChange={handleToggle}
                        disabled={isLoading}
                    />
                    <div className="w-14 h-7 bg-black/10 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 flex items-center justify-center">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white absolute" />}
                    </div>
                </label>
            </div>
        </div>
    );
}
