import React from 'react';
import { User, Mail, Shield, Calendar, Key } from 'lucide-react';
import SecurityActions from './SecurityActions';
import { cn } from '@/lib/utils';

function DetailCard({ icon: Icon, label, value, isSensitive = false }: { icon: any, label: string, value: string, isSensitive?: boolean }) {
    return (
        <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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

export default function AccountTab({ user }: { user: any }) {
    const joinedDate = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(new Date(user.createdAt));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                <div className="lg:col-span-2 bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-xl flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 p-1 flex-shrink-0 shadow-xl shadow-purple-500/20">
                        <div className="w-full h-full rounded-full bg-background/80 dark:bg-background/50 backdrop-blur-md flex items-center justify-center overflow-hidden">
                            <User className="w-12 h-12 md:w-16 md:h-16 text-foreground/40" />
                        </div>
                    </div>
                    <div className="text-center md:text-left space-y-2 flex-1 relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">AutoAlpha Investor</h2>
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
            </div>

            <div className="relative z-10 space-y-6">
                <h3 className="text-xl font-bold text-foreground">Security Actions</h3>
                <SecurityActions hasPassword={!!user.passwordHash} />
            </div>
        </div>
    );
}
