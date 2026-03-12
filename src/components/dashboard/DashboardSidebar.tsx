'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Store, FileText, Settings, User, ChevronLeft, ChevronRight, Gift, LogOut, Wallet, HelpCircle, Activity, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useRealtime } from '@/components/dashboard/RealtimeProvider';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function DashboardSidebar({ children, notificationBell, userId, balances }: { children?: React.ReactNode, notificationBell?: React.ReactNode, userId?: string, balances?: { usdtBalance: number; usdcBalance: number } }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isSoundEnabled, toggleSound } = useRealtime();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-collapse on small screens
    useEffect(() => {
        const checkScreenSize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Strategy Report', href: '/dashboard/strategy-report', icon: Activity },
        { name: 'Marketplace', href: '/dashboard/market', icon: Store },
        { name: 'Accounting', href: '/dashboard/accounting', icon: FileText },
        { name: 'Account Hub', href: '/dashboard/account', icon: User },
        { name: 'Affiliates', href: '/dashboard/affiliate', icon: Gift },
        { name: 'Academy', href: '/dashboard/academy', icon: HelpCircle },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn("hidden md:flex bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-r border-black/5 dark:border-white/10 h-screen fixed top-0 left-0 flex-col z-50 transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
                <div className="h-20 flex items-center justify-between px-4 border-b border-black/5 dark:border-white/10">
                    <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed ? "w-8 opacity-0 pointer-events-none absolute" : "w-auto opacity-100 relative")}>
                        <div className="w-8 h-8 rounded-lg outline-none flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <div className="w-3 h-3 bg-white rounded-sm transform rotate-45" />
                        </div>
                        <span className="font-bold text-lg text-foreground tracking-tight whitespace-nowrap">AutoAlpha</span>
                    </div>

                    {/* Always show the logo icon when collapsed */}
                    {isCollapsed && (
                        <div className="absolute left-6 w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <div className="w-3 h-3 bg-white rounded-sm transform rotate-45" />
                        </div>
                    )}

                    {/* Only show toggle button inside the header when expanded. When collapsed it looks better floating or we can keep it as a button */}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className={cn("hidden md:block p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all z-10", isCollapsed ? "absolute -right-3 top-6 bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-sm rounded-full" : "")}>
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === item.href || pathname.startsWith(item.href + '/');

                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 py-3 rounded-xl text-sm font-bold transition-all relative group",
                                    isCollapsed ? "px-0 justify-center" : "px-3",
                                    isActive
                                        ? "bg-foreground text-background shadow-lg shadow-black/10 dark:shadow-white/5"
                                        : "text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-background" : "text-foreground/50")} />
                                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}

                                {/* Tooltip for collapsed mode */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap pointer-events-none hidden md:block">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 pb-8 border-t border-black/5 dark:border-white/10 flex flex-col items-center gap-2 overflow-hidden">
                    <div className="w-full flex flex-col gap-2 mb-2">
                        <Link href="/dashboard/deposit" className={cn("flex items-center justify-center gap-2 py-3 text-sm font-bold bg-gradient-to-br from-cyan-400 to-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:opacity-90 transition-all w-full", isCollapsed ? "px-0" : "px-3")}>
                            <Wallet className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="whitespace-nowrap">Deposit</span>}
                        </Link>
                        <Link href="/dashboard/withdraw" className={cn("flex items-center justify-center gap-2 py-3 text-sm font-bold bg-white/50 dark:bg-white/5 backdrop-blur-md text-foreground border border-black/5 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all w-full", isCollapsed ? "px-0" : "px-3")}>
                            <ArrowUpRight className="w-5 h-5 flex-shrink-0 opacity-70" />
                            {!isCollapsed && <span className="whitespace-nowrap">Withdraw</span>}
                        </Link>
                    </div>

                    <div className="w-full h-px bg-black/5 dark:bg-white/10" />

                    <div className="w-full flex flex-col gap-1 mt-3">
                        <Link href="/" className={cn("flex items-center gap-3 py-3 text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="whitespace-nowrap">Home</span>}
                        </Link>
                        <button onClick={() => signOut({ callbackUrl: '/login' })} className={cn("flex items-center gap-3 py-3 text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="whitespace-nowrap">Log Out</span>}
                        </button>
                        <button onClick={toggleSound} className={cn("flex items-center gap-3 py-3 text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                            {isSoundEnabled ? <Volume2 className="w-5 h-5 flex-shrink-0" /> : <VolumeX className="w-5 h-5 flex-shrink-0 opacity-50" />}
                            {!isCollapsed && <span className="whitespace-nowrap">{isSoundEnabled ? "Sound On" : "Sound Off"}</span>}
                        </button>
                        {mounted && (
                            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={cn("flex items-center gap-3 py-3 text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                                {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" /> : <Moon className="w-5 h-5 flex-shrink-0 text-blue-500" />}
                                {!isCollapsed && <span className="whitespace-nowrap">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                            </button>
                        )}
                    </div>
                    
                    {!isCollapsed && (
                        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 flex flex-col gap-2 w-full text-center">
                            <div className="flex justify-center gap-3 text-[10px] font-bold tracking-widest uppercase text-foreground/40">
                                <Link href="/terms" target="_blank" className="hover:text-foreground transition-colors">Terms</Link>
                                <Link href="/privacy" target="_blank" className="hover:text-foreground transition-colors">Privacy</Link>
                                <Link href="/risk" target="_blank" className="hover:text-foreground transition-colors">Risk</Link>
                            </div>
                            <span className="text-[10px] text-foreground/30 font-medium tracking-wide">© 2026 AutoAlpha</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={cn("flex-1 flex flex-col min-h-screen w-full md:w-auto max-w-[100vw] md:max-w-none overflow-x-hidden relative z-10 transition-all duration-300 pb-20 md:pb-0", isCollapsed ? "md:ml-20" : "md:ml-64 lg:ml-64")}>
                {notificationBell && (
                    <div className="absolute top-6 right-8 z-50">
                        {notificationBell}
                    </div>
                )}
                <main className="flex-1 transition-all duration-300 w-full overflow-hidden">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation (Floating Pill) */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
                <nav className="h-16 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[2rem] flex items-center justify-around px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                {navItems.filter(item => ['Overview', 'Strategy Report', 'Marketplace'].includes(item.name)).map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname === item.href || pathname.startsWith(item.href + '/');

                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all duration-300",
                                isActive
                                    ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                                    : "text-foreground/40 hover:text-foreground/70 active:scale-95"
                            )}
                        >
                            <Icon className={cn("w-5.5 h-5.5 transition-transform duration-300", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "")} />
                            {isActive && (
                                <motion.div
                                    layoutId="mobileNavIndicator"
                                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400"
                                />
                            )}
                        </Link>
                    );
                })}
                <Link
                    href="/dashboard/deposit"
                    className={cn(
                        "relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all duration-300 group",
                        pathname === '/dashboard/deposit'
                            ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                            : "text-foreground/40 hover:text-foreground/70 active:scale-95"
                    )}
                    aria-label="Deposit"
                    title="Deposit"
                >
                    <Wallet className={cn("w-5.5 h-5.5 transition-transform duration-300", pathname === '/dashboard/deposit' ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "group-hover:text-purple-500 transition-colors")} />
                    {pathname === '/dashboard/deposit' && (
                        <motion.div
                            layoutId="mobileNavIndicator"
                            className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400"
                        />
                    )}
                </Link>
                <Link
                    href="/dashboard/withdraw"
                    className={cn(
                        "relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all duration-300 group",
                        pathname === '/dashboard/withdraw'
                            ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                            : "text-foreground/40 hover:text-foreground/70 active:scale-95"
                    )}
                    aria-label="Withdraw"
                    title="Withdraw"
                >
                    <ArrowUpRight className={cn("w-5.5 h-5.5 transition-transform duration-300", pathname === '/dashboard/withdraw' ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "group-hover:text-emerald-500 transition-colors")} />
                    {pathname === '/dashboard/withdraw' && (
                        <motion.div
                            layoutId="mobileNavIndicator"
                            className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400"
                        />
                    )}
                </Link>
                </nav>
            </div>
        </>
    );
}
