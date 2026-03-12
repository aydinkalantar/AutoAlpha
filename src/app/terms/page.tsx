import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 dark:bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors font-medium text-sm mb-12 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 dark:border-white/10">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 md:p-12 shadow-xl">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Terms of Service</h1>
                    <p className="text-foreground/60 mb-12">Last Updated: March 2026</p>

                    <div className="space-y-12 prose prose-lg dark:prose-invert max-w-none">
                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">1. Acceptance of Terms</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                By accessing or using the AutoAlpha platform ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">2. Account Responsibilities</h2>
                            <h3 className="text-xl font-semibold mb-2 mt-6">API Key Security</h3>
                            <p className="text-foreground/80 leading-relaxed mb-4">
                                You are 100% responsible for the security of your exchange API keys. If your API key is compromised because it was mishandled, leaked, or posted publicly by you, AutoAlpha is not liable for any resulting losses.
                            </p>
                            
                            <h3 className="text-xl font-semibold mb-2 mt-6">Execution-Only Permissions</h3>
                            <p className="text-foreground/80 leading-relaxed">
                                You agree to provide AutoAlpha with API keys that explicitly have "Withdrawal" permissions <strong>DISABLED</strong>. AutoAlpha only requires "Trade" or "Execution" permissions. We are not responsible for any issues arising from granting excessive permissions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">3. Intellectual Property (IP)</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                AutoAlpha's algorithmic strategies, code, and webhooks are proprietary. You are granted a limited license to rent access to these trading signals. Any attempt to copy, reverse-engineer, or redistribute AutoAlpha's logic, Pine Scripts, or server infrastructure will result in immediate termination of your account without refund and potential legal action.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">4. "Gas Tank" Payment & Refund Policy</h2>
                            <p className="text-foreground/80 leading-relaxed mb-4">
                                AutoAlpha operates on a prepaid "Gas" model based on a High-Water Mark performance fee.
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-foreground/80">
                                <li><strong>Non-Refundable Balances:</strong> Deposited funds into your "Gas Tank" are strictly non-refundable once your first trade is executed via the platform.</li>
                                <li><strong>The High-Water Mark Agreement:</strong> Performance fees (e.g., 20%) are only deducted from your Gas Tank on finalized, realized net profits that exceed your historical all-time high balance (the High-Water Mark). You will not be charged fees while recovering from a drawdown.</li>
                                <li><strong>Account Dormancy:</strong> If your account remains completely inactive (no connected exchanges, no executed trades) for a continuous period of 12 months, any remaining balance in your Gas Tank will expire and be forfeited.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">5. Service Interruptions & Liability</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                AutoAlpha provides the Service on an "as is" and "as available" basis. We do not guarantee 100% continuous uptime. We are not liable for trading losses caused by server downtime, third-party exchange API failures (e.g., Binance going offline), webhooks failing, or extreme market slippage during flash crashes. AutoAlpha is a software execution tool, not a financial advisor.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
