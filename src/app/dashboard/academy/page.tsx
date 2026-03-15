import React from "react";
import { BookOpen, ShieldCheck, Zap, Scale, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AcademyPage() {
    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-8 md:space-y-12">
            <div className="flex flex-col gap-2 pr-16 md:pr-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                        <BookOpen className="w-5 h-5 text-indigo-500" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">AutoAlpha Academy</h1>
                </div>
                <p className="text-foreground/60 max-w-2xl text-lg mt-2">
                    Everything you need to know about the terminal's architecture, security protocols, and terminology.
                </p>
            </div>

            <div className="grid gap-8">
                
                {/* Section 1: Terminology */}
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Scale className="w-6 h-6 text-cyan-500" />
                        <h2 className="text-2xl font-bold tracking-tight">Core Terminology</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                            <h3 className="font-bold mb-2">Profit Factor (PF)</h3>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                A mathematical ratio of gross profit divided by gross loss. A PF of 1.5 means the strategy makes $1.50 for every $1.00 it loses. Anything above 1.0 is profitable. Elite quantitative strategies aim for 1.4+.
                            </p>
                        </div>
                        <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                            <h3 className="font-bold mb-2">Maximum Drawdown (MDD)</h3>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                The largest percentage drop in account equity from a historical peak before a new peak is achieved. A 15% MDD means the worst historical string of losses wiped out 15% of the capital before recovering.
                            </p>
                        </div>
                        <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                            <h3 className="font-bold mb-2">Win Rate</h3>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                The percentage of trades that close in profit. Note: A high win rate does not guarantee profitability if the average loss is much larger than the average win.
                            </p>
                        </div>
                        <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                            <h3 className="font-bold mb-2">Total Return (yield)</h3>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                Your pure Return on Investment (ROI), calculated as Total Net Profit divided by Total Allocated Capital.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Security & API Keys */}
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-2xl font-bold tracking-tight">Security & The Vault</h2>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-foreground/80 leading-relaxed text-base">
                            AutoAlpha utilizes a zero-trust architecture for managing your exchange API keys. When you submit API credentials:
                        </p>
                        <ul className="space-y-3 mt-4 text-foreground/70">
                            <li><strong>AES-256-GCM Encryption:</strong> Keys are instantly encrypted at the application layer before they ever touch the database.</li>
                            <li><strong>No Withdrawal Permissions:</strong> The terminal actively rejects API keys that have withdrawal permissions enabled. We can only execute trades, never move your underlying funds.</li>
                            <li><strong>Memory Isolation:</strong> Keys are decrypted only within the specific memory space of the BullMQ background worker immediately preceding execution.</li>
                        </ul>
                    </div>
                </div>

                {/* Section 3: Performance Fees */}
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-6 h-6 text-amber-500" />
                        <h2 className="text-2xl font-bold tracking-tight">Performance Fees (Gas)</h2>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1 prose prose-sm dark:prose-invert">
                            <p className="text-foreground/80 leading-relaxed text-base">
                                AutoAlpha charges a <strong>30% Performance Fee</strong> on *profitable trades only*. We never charge management fees or AUM fees. If an algorithm doesn't make you money, it costs you nothing.
                            </p>
                            <p className="text-foreground/80 leading-relaxed text-base mt-4">
                                Because we cannot (and will not) withdraw from your exchange to collect our 30% cut, you must pre-fund your AutoAlpha internal wallet. This acts as "Gas".
                            </p>
                        </div>
                        <div className="w-full md:w-1/3 bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5">
                            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-foreground/50">Example Scenario</h4>
                            <ul className="space-y-3 text-sm text-foreground/80">
                                <li className="flex justify-between"><span>Trade Profit:</span> <span className="font-bold text-emerald-500">+$100.00</span></li>
                                <li className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>Gas Required (30%):</span> <span className="text-rose-500">-$30.00</span></li>
                                <li className="flex justify-between pt-1"><span>You Keep:</span> <span className="font-bold">$100.00 on exchange</span></li>
                            </ul>
                            <p className="text-xs text-foreground/50 mt-4 italic">The $30.00 is automatically deducted from your AutoAlpha internal wallet.</p>
                        </div>
                    </div>
                </div>

                {/* Section 4: Sandbox vs Live */}
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Layers className="w-6 h-6 text-indigo-500" />
                        <h2 className="text-2xl font-bold tracking-tight">Sandbox vs. Live</h2>
                    </div>
                    <p className="text-foreground/80 leading-relaxed text-base mb-6">
                        The Sandbox is a simulated environment utilizing live market data. While extremely accurate, there are slight mechanical differences to note:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
                            <h3 className="font-bold text-cyan-600 dark:text-cyan-400 mb-2">Sandbox Mechanics</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm text-foreground/70">
                                <li>Instant execution with zero latency</li>
                                <li>Zero slippage guaranteed</li>
                                <li>Infinite liquidity at the mark price</li>
                                <li>No actual exchange fees</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10">
                            <h3 className="font-bold mb-2">Live Mechanics</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm text-foreground/70">
                                <li>30-80ms API latency depending on exchange</li>
                                <li>Variable slippage depending on order book</li>
                                <li>Liquidity limitations based on volume</li>
                                <li>Standard exchange maker/taker fees apply</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
