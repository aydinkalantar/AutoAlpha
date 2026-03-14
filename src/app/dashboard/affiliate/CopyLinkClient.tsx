"use client";

import { useState } from "react";
import { Link as LinkIcon, Check, Copy } from "lucide-react";

export function CopyLinkClient({ referralCode }: { referralCode: string }) {
    const [copied, setCopied] = useState(false);

    const link = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${referralCode}` : `https://autoalpha.trade/register?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-foreground/40" />
                </div>
                <input
                    type="text"
                    readOnly
                    title="Referral Link"
                    placeholder="Referral Link"
                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-foreground font-mono text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-inner"
                    value={link}
                />
            </div>
            <button 
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-lg shadow-purple-500/20 text-white font-bold hover:opacity-90 transition-opacity min-w-[140px]"
            >
                {copied ? <><Check className="w-5 h-5"/> Copied!</> : <><Copy className="w-5 h-5" /> Copy Link</>}
            </button>
        </div>
    );
}
