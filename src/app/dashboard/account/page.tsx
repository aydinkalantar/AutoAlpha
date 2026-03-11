import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import { User, Shield, Mail, Calendar, Key, Copy, CheckCircle2, Settings, Gift, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const dynamic = 'force-dynamic';



function DetailCard({ icon: Icon, label, value, isSensitive = false }: { icon: any, label: string, value: string, isSensitive?: boolean }) {
    return (
        <div className="bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 flex items-center justify-center flex-shrink-0 border border-black/5 dark:border-white/10">
                    <Icon className="w-6 h-6 text-foreground/80" />
                </div>
                <div className="flex-1 w-full overflow-hidden">
                    <p className="text-sm font-medium text-foreground/50">{label}</p>
                    <p className={cn("text-lg font-bold text-foreground truncate mt-0.5", isSensitive ? "font-mono" : "")}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default async function AccountHubPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        redirect("/api/auth/signin");
    }

    const joinedDate = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(new Date(user.createdAt));

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 relative z-10">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Account Hub</h1>
                        <p className="text-foreground/60 mt-2 text-lg">Manage your personal profile and security configurations.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                <div className="lg:col-span-3 bg-white/50 dark:bg-black/40 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 p-1 flex-shrink-0 shadow-xl shadow-purple-500/20">
                        <div className="w-full h-full rounded-full bg-background/80 dark:bg-background/50 backdrop-blur-md flex items-center justify-center overflow-hidden">
                            <User className="w-16 h-16 text-foreground/40" />
                        </div>
                    </div>
                    <div className="text-center md:text-left space-y-2 flex-1 relative z-10">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight">AutoAlpha Investor</h2>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-foreground/60 font-medium">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-sm font-semibold mt-4">
                            <Shield className="w-4 h-4" />
                            Account Verified
                        </div>
                    </div>
                </div>

                <DetailCard
                    icon={Key}
                    label="Account Identifier (UUID)"
                    value={user.id}
                    isSensitive={true}
                />

                <DetailCard
                    icon={Calendar}
                    label="Member Since"
                    value={joinedDate}
                />

                <DetailCard
                    icon={Shield}
                    label="Account Role"
                    value={user.role}
                />
            </div>

            {/* Quick Links Hub (Crucial for Mobile Navigation) */}
            <div className="relative z-10 space-y-6">
                <h3 className="text-xl font-bold text-foreground">Navigation Hub</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href="/dashboard/settings" className="bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-foreground/5 rounded-xl text-foreground">
                                <Settings className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-lg">Settings</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-foreground/40 group-hover:text-foreground transition-colors" />
                    </Link>

                    <Link href="/dashboard/affiliate" className="bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                <Gift className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-lg">Affiliates</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-foreground/40 group-hover:text-foreground transition-colors" />
                    </Link>

                    {/* Accounting is typically in bottom nav, but good to have here just in case users expect it in the Hub */}
                    <Link href="/dashboard/accounting" className="bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/5 transition-all md:hidden">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-lg">Accounting</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-foreground/40 group-hover:text-foreground transition-colors" />
                    </Link>
                </div>
            </div>

            <div className="relative z-10 space-y-6">
                <h3 className="text-xl font-bold text-foreground">Security Actions</h3>
                <div className="bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6">
                    <p className="text-foreground/60 mb-6">Security actions such as password resets and 2FA configuration are handled via your NextAuth provider. If you signed in via Google, manage your security there. If using credentials, contact support.</p>
                    <button disabled className="px-6 py-3 rounded-xl bg-foreground/5 text-foreground/50 border border-foreground/10 font-bold cursor-not-allowed">
                        Change Password
                    </button>
                    <button disabled className="px-6 py-3 ml-4 rounded-xl bg-red-500/5 text-red-500/50 border border-red-500/10 font-bold cursor-not-allowed">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
