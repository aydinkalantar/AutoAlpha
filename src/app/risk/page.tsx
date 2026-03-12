import React from 'react';
import Link from 'next/link';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

export default function RiskDisclaimerPage() {
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-600/10 dark:bg-red-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 dark:bg-orange-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors font-medium text-sm mb-12 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 dark:border-white/10">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-red-500/20 rounded-[2rem] p-8 md:p-12 shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-red-500/20 text-red-500 rounded-xl">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Mandatory Risk Disclaimer</h1>
                    </div>
                    
                    <p className="text-foreground/60 mb-12">Please read this document carefully before utilizing AutoAlpha.</p>

                    <div className="space-y-12 prose prose-lg dark:prose-invert max-w-none">
                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4 text-red-500 dark:text-red-400">1. No Financial Advice</h2>
                            <p className="text-foreground/80 leading-relaxed font-medium">
                                AutoAlpha is a software tool, not a registered investment advisor, broker-dealer, or fiduciary. The AutoAlpha platform provides automated trade execution software based on algorithmic signals. None of the information, strategies, or features provided by AutoAlpha should be considered personalized financial, investment, or trading advice. You are solely responsible for evaluating the merits and risks associated with the use of any AutoAlpha strategy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">2. Past Performance Warning</h2>
                            <p className="text-foreground/80 leading-relaxed text-xl font-bold border-l-4 border-red-500 pl-6 my-6">
                                PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS.
                            </p>
                            <p className="text-foreground/80 leading-relaxed">
                                Historical backtests, live trading records, or advertised Annual Percentage Yields (APY) represent past strategy performance. Markets are highly volatile and unpredictable. A strategy that generated profit in the past can and may incur heavy losses in the future.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">3. Total Loss Possibility</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Trading cryptocurrency, particularly using leverage or derivatives (such as perpetual futures), involves <strong>extreme risk</strong>. You could lose your entire exchange balance rapidly. Do not deploy capital that you cannot afford to lose. You assume full responsibility for any trading losses incurred while using AutoAlpha's execution tools.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">4. Technology Risks</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                AutoAlpha relies on complex technological infrastructure, including third-party exchange aggregators, webhooks, and cloud servers. You acknowledge and accept the risks of technical failures outside of AutoAlpha's control. These include, but are not limited to:
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-foreground/80 mt-4">
                                <li>Cryptocurrency exchanges (e.g., Binance, Bybit) suspending service, terminating APIs, or experiencing outages.</li>
                                <li>Extreme market volatility causing severe slippage between the signal price and actual execution price.</li>
                                <li>Failure of webhook deliveries prohibiting timely trade entries or exits.</li>
                                <li>Liquidation events triggered by rapid price fluctuations before the software can execute a stop-loss.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
