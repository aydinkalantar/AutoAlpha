import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
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
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Privacy Policy</h1>
                    <p className="text-foreground/60 mb-12">Last Updated: March 2026</p>

                    <div className="space-y-12 prose prose-lg dark:prose-invert max-w-none">
                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">1. Data Collection</h2>
                            <p className="text-foreground/80 leading-relaxed mb-4">
                                AutoAlpha collects only the data necessary to provide and secure our algorithmic trading services. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-foreground/80">
                                <li><strong>Account Information:</strong> Your email address and hashed passwords.</li>
                                <li><strong>Trading Data:</strong> Historical records of trades executed by our software on your behalf, portfolio balances, and strategy subscriptions.</li>
                                <li><strong>API Keys:</strong> Exchange API keys and secrets provided by you to allow our algorithms to execute trades.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">2. Data Storage & Security</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Security is our top priority. Your exchange API keys and secrets are heavily encrypted at rest using industry-standard AES-256 encryption. We utilize strict access controls, and your plaintext secret keys are never visible in our database or logs. They are only decrypted ephemerally in memory at the exact moment a trade execution is required.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">3. Third-Party Sharing</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                We do not sell, rent, or trade your personal information. We only share necessary data with trusted third-party service providers required to operate our platform. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-foreground/80 mt-4">
                                <li><strong>Payment Processors:</strong> Necessary billing information routed securely through our payment partners (e.g., Stripe or Web3 payment gateways).</li>
                                <li><strong>Cloud Infrastructure:</strong> Standard, secure cloud hosting providers (e.g., AWS, Vercel) that power our application servers and databases.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold tracking-tight mb-4">4. Your Rights</h2>
                            <p className="text-foreground/80 leading-relaxed">
                                Depending on your jurisdiction (such as GDPR in Europe or CCPA in California), you have the right to request access to, correction of, or deletion of your personal data. You may delete your exchange API keys from our system at any time via your Account Dashboard.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
