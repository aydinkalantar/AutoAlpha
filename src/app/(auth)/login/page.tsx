'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LogIn, Mail, Lock, AlertTriangle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await signIn('credentials', {
                username: formData.email,
                password: formData.password,
                redirect: false
            });

            if (res?.error) {
                // NextAuth typically returns errors as generic messages
                throw new Error("Invalid email or password.");
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
        <div className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-background">
            
            {/* Step 2: The Mobile Logo (Top) */}
            <div className="flex md:hidden w-full items-center justify-center pt-16 pb-6 relative z-20">

                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 shadow-lg shadow-purple-500/20 pointer-events-none">
                     <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center">
                         <span className="font-bold text-3xl tracking-tighter">A</span>
                     </div>
                 </div>
            </div>

            {/* Step 3: The Left Panel (Desktop Only - Info & Glassmorphism) */}
            <div className="hidden md:flex md:w-1/2 p-10 flex-col justify-center items-center relative overflow-hidden bg-black/5 dark:bg-white/5">
                {/* Ambient Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-cyan-500/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />



                <div className="relative z-10 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-12 max-w-lg w-full shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <div className="w-4 h-4 bg-white rounded-sm transform rotate-45" />
                        </div>
                        <span className="font-bold text-3xl tracking-tight text-foreground">AutoAlpha</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground mb-4">
                        Automate Your Alpha.
                    </h2>
                    <p className="text-lg text-foreground/60 leading-relaxed mb-8">
                        Connect your exchange. Select elite quantitative strategies. Let the execution engine do the rest.
                    </p>

                    <div className="space-y-4">
                        {[
                            "Non-Custodial Architecture",
                            "Millisecond Execution",
                            "High-Water Mark Performance Fees"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                    <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="font-medium text-foreground/80">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step 4: The Right Panel (The Form Container) */}
            <div className="w-full mt-auto pb-12 px-6 flex flex-col justify-end md:w-1/2 md:p-12 md:justify-center md:mt-0 md:pb-12 relative z-10">
                <div className="w-full max-w-md mx-auto">
                    <div className="text-left mb-8 hidden md:block">
                        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
                        <p className="text-foreground/60 mt-2">Log in to manage your automated strategies.</p>
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
                                    type="text"
                                    required
                                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner"
                                    placeholder="info@autoalpha.trade"
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
                                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-black/10 dark:focus:border-white/10 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 shadow-lg shadow-purple-500/20"
                        >
                            {isLoading ? 'Authenticating...' : 'Log In'}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                        <span className="px-4 text-sm text-foreground/40 font-medium">OR</span>
                        <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                    </div>

                    <button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                        className="w-full mt-6 py-4 rounded-xl bg-white dark:bg-[#1C1C1E] text-black dark:text-white border border-black/10 dark:border-white/10 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-3 shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="mt-8 text-center text-foreground/60 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 font-bold transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
