'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { UserPlus, Mail, Lock, Link as LinkIcon, AlertTriangle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        referralCode: '',
        acceptedTerms: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        if (!formData.acceptedTerms) {
            setError("You must agree to the Terms of Service and Risk Disclaimers to proceed.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed.');
            }

            // Immediately sign them in
            const signInRes = await signIn('credentials', {
                username: formData.email, // using email as username parameter for NextAuth
                password: formData.password,
                redirect: false
            });

            if (signInRes?.error) {
                throw new Error(signInRes.error);
            }

            router.push('/dashboard');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/20 to-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Back to Home */}
            <Link href="/" className="absolute top-8 left-8 lg:top-12 lg:left-12 flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors font-medium text-sm z-50 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 dark:border-white/10">
                <ChevronLeft className="w-4 h-4" />
                Back to Home
            </Link>

            <div className="w-full max-w-md relative z-10 my-10">
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 mx-auto mb-6">
                            <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center">
                                <UserPlus className="w-8 h-8 text-foreground" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
                        <p className="text-foreground/60 mt-2">Join AutoAlpha and start outperforming.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-500 text-sm">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-foreground/40" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                    placeholder="investor@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-foreground/40" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80 flex justify-between">
                                <span>Referral Code</span>
                                <span className="text-foreground/40 font-normal">Optional</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LinkIcon className="h-5 w-5 text-foreground/40" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground font-mono placeholder:font-sans placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                    placeholder="Paste referral code"
                                    value={formData.referralCode}
                                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 mt-4 pt-2">
                            <input
                                type="checkbox"
                                id="termsCheckbox"
                                className="mt-1 w-4 h-4 rounded border-black/10 dark:border-white/10 text-purple-600 focus:ring-purple-500/50"
                                checked={formData.acceptedTerms}
                                onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                required
                            />
                            <label htmlFor="termsCheckbox" className="text-xs text-foreground/70 leading-relaxed">
                                I confirm that I have read and agree to AutoAlpha's <Link href="/terms" target="_blank" className="text-purple-500 hover:text-purple-400 font-medium whitespace-nowrap">Terms of Service</Link>, <Link href="/privacy" target="_blank" className="text-purple-500 hover:text-purple-400 font-medium whitespace-nowrap">Privacy Policy</Link>, and the <Link href="/risk" target="_blank" className="text-purple-500 hover:text-purple-400 font-medium whitespace-nowrap">Mandatory Risk Disclaimers</Link>. I understand that algorithmic trading involves extreme risk.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 shadow-lg shadow-purple-500/20"
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-foreground/60 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
