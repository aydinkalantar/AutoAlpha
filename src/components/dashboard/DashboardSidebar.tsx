'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Store, FileText, Settings, User, ChevronLeft, ChevronRight, Gift, LogOut, Wallet, HelpCircle, Activity, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useRealtime } from '@/components/dashboard/RealtimeProvider';
import { Button } from '@/components/ui/button';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function DashboardSidebar({ children, notificationBell, userId, balances }: { children?: React.ReactNode, notificationBell?: React.ReactNode, userId?: string, balances?: { usdtBalance: number; usdcBalance: number } }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isSoundEnabled, toggleSound } = useRealtime();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            // Also apply to html to prevent iOS Safari bounce
            document.documentElement.style.overflow = 'hidden';
            
            // Adjust fixed background positioning if necessary
            // document.body.style.position = 'fixed'; 
            // document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            // document.body.style.position = '';
            // document.body.style.width = '';
        }
    }, [isMobileMenuOpen]);

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

    // Split nav items for mobile
    const bottomBarItems = navItems.filter(item => ['Overview', 'Marketplace', 'Strategy Report'].includes(item.name));
    const drawerItems = navItems.filter(item => !['Overview', 'Marketplace', 'Strategy Report'].includes(item.name));

    return (
        <>
            {/* Mobile Top Header */}
            <div className="flex md:hidden fixed top-0 w-full h-16 z-50 px-4 justify-between items-center bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg outline-none flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <div className="w-3 h-3 bg-white rounded-sm transform rotate-45" />
                    </div>
                    <span className="font-bold text-lg text-foreground tracking-tight">AutoAlpha</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-foreground/80 hover:text-foreground active:scale-95 transition-all"
                    aria-label="Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

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
                            {!isCollapsed && <span className="whitespace-nowrap">Fund Gas Tank</span>}
                        </Link>
                    </div>

                    <div className="w-full h-px bg-black/5 dark:bg-white/10" />

                    <div className="w-full flex flex-col gap-1 mt-3">
                        <Link href="/" className={cn("flex items-center gap-3 py-3 text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="whitespace-nowrap">Home</span>}
                        </Link>
                        <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/login' })} className={cn("flex items-center justify-start gap-3 py-3 h-auto text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="whitespace-nowrap font-bold">Log Out</span>}
                        </Button>
                        <Button variant="ghost" onClick={toggleSound} className={cn("flex items-center justify-start gap-3 py-3 h-auto text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                            {isSoundEnabled ? <Volume2 className="w-5 h-5 flex-shrink-0" /> : <VolumeX className="w-5 h-5 flex-shrink-0 opacity-50" />}
                            {!isCollapsed && <span className="whitespace-nowrap font-bold">{isSoundEnabled ? "Sound On" : "Sound Off"}</span>}
                        </Button>
                        {mounted && (
                            <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={cn("flex items-center justify-start gap-3 py-3 h-auto text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                                {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" /> : <Moon className="w-5 h-5 flex-shrink-0 text-blue-500" />}
                                {!isCollapsed && <span className="whitespace-nowrap font-bold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                            </Button>
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

            <div className={cn("flex-1 flex flex-col min-h-screen w-full md:w-auto max-w-[100vw] md:max-w-none overflow-x-hidden relative z-10 transition-all duration-300 pt-20 pb-28 md:pt-0 md:pb-0", isCollapsed ? "md:ml-20" : "md:ml-64 lg:ml-64")}>
                <main className="flex-1 transition-all duration-300 w-full overflow-hidden">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation (Floating Pill) */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
                <nav className="h-16 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[2rem] flex items-center justify-around px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                {bottomBarItems.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? !isMobileMenuOpen && pathname === '/dashboard'
                        : !isMobileMenuOpen && (pathname === item.href || pathname.startsWith(item.href + '/'));

                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-[var(--mobile-icon-width)] h-12 rounded-2xl transition-all duration-300",
                                isActive
                                    ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                                    : "text-foreground/40 hover:text-foreground/70 active:scale-95"
                            )}
                            style={{ "--mobile-icon-width": "calc(20vw - 12px)" } as any}
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-[var(--mobile-icon-width)] h-12 rounded-2xl transition-all duration-300 group",
                        !isMobileMenuOpen && pathname === '/dashboard/deposit'
                            ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                            : "text-foreground/40 hover:text-foreground/70 active:scale-95"
                    )}
                    style={{ "--mobile-icon-width": "calc(20vw - 12px)" } as any}
                    aria-label="Deposit"
                    title="Deposit"
                >
                    <Wallet className={cn("w-5.5 h-5.5 transition-transform duration-300", !isMobileMenuOpen && pathname === '/dashboard/deposit' ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "group-hover:text-purple-500 transition-colors")} />
                    {!isMobileMenuOpen && pathname === '/dashboard/deposit' && (
                        <motion.div
                            layoutId="mobileNavIndicator"
                            className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400"
                        />
                    )}
                </Link>
                
                {/* Mobile Settings Shortcut */}
                <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-[var(--mobile-icon-width)] h-12 rounded-2xl transition-all duration-300 group",
                        !isMobileMenuOpen && pathname.startsWith('/dashboard/settings')
                            ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                            : "text-foreground/40 hover:text-foreground/70 active:scale-95"
                    )}
                    style={{ "--mobile-icon-width": "calc(20vw - 12px)" } as any}
                    aria-label="Settings"
                    title="Settings"
                >
                    <Settings className={cn("w-5.5 h-5.5 transition-transform duration-300", !isMobileMenuOpen && pathname.startsWith('/dashboard/settings') ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "group-hover:text-purple-500 transition-colors")} />
                    {!isMobileMenuOpen && pathname.startsWith('/dashboard/settings') && (
                        <motion.div
                            layoutId="mobileNavIndicator"
                            className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400"
                        />
                    )}
                </Link>
                </nav>
            </div>

            {/* Premium Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="md:hidden fixed inset-0 z-[40] bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%", opacity: 0.8 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0.8 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="md:hidden fixed bottom-0 left-0 right-0 h-[85vh] z-[45] bg-white/95 dark:bg-[#121214]/95 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden will-change-transform"
                        >
                            {/* Drag Indicator */}
                            <div className="w-full h-8 flex items-center justify-center shrink-0 cursor-pointer" 
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full" />
                            </div>

                            <div className="flex-1 overflow-y-auto pb-4 px-6 no-scrollbar touch-pan-y shadow-[inset_0_40px_40px_-40px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_40px_40px_-40px_rgba(0,0,0,0.2)]">
                                
                                <div className="pb-6 pt-2">
                                    <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">Menu</h3>
                                    <p className="text-sm text-foreground/50 font-medium">Access your account, settings, and more.</p>
                                </div>

                                <div className="space-y-1.5 mb-6">
                                    {drawerItems.map((item) => {
                                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 active:scale-[0.98]",
                                                    isActive 
                                                        ? "bg-foreground text-background shadow-lg shadow-black/10 dark:shadow-white/5" 
                                                        : "bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-1.5 rounded-xl", isActive ? "bg-background/20" : "bg-black/5 dark:bg-white/10")}>
                                                        <Icon className={cn("w-4 h-4", isActive ? "text-background" : "text-foreground")} />
                                                    </div>
                                                    <span className="font-bold text-base">{item.name}</span>
                                                </div>
                                                <ChevronRight className={cn("w-4 h-4", isActive ? "text-background/50" : "text-foreground/30")} />
                                            </Link>
                                        )
                                    })}
                                </div>

                                <div className="h-px w-full bg-black/5 dark:bg-white/10 mb-6" />

                                <div className="space-y-3 mb-6">
                                    <h4 className="text-xs font-bold tracking-widest uppercase text-foreground/40 px-2">Quick Actions</h4>
                                    <div className="grid grid-cols-2 gap-3">                                        <Button 
                                            variant="ghost"
                                            onClick={toggleSound} 
                                            className="h-auto flex flex-col items-center justify-center gap-2 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/15 dark:active:bg-white/15 rounded-2xl transition-colors"
                                        >
                                            <div className="p-1.5 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm">
                                                {isSoundEnabled ? <Volume2 className="w-4 h-4 text-foreground" /> : <VolumeX className="w-4 h-4 opacity-50 text-foreground" />}
                                            </div>
                                            <span className="text-xs font-bold">{isSoundEnabled ? "Sound On" : "Sound Off"}</span>
                                        </Button>

                                        {mounted && (
                                            <Button 
                                                variant="ghost"
                                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                                                className="h-auto flex flex-col items-center justify-center gap-2 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/15 dark:active:bg-white/15 rounded-2xl transition-colors"
                                            >
                                                <div className="p-1.5 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm">
                                                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
                                                </div>
                                                <span className="text-xs font-bold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                            </Button>
                                        )}
                                    </div>

                                        <Button 
                                            variant="ghost"
                                            onClick={() => signOut({ callbackUrl: '/login' })} 
                                            className="w-full flex items-center h-auto justify-center gap-2 py-3 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-500/10 active:bg-red-100 dark:active:bg-red-500/20 rounded-2xl transition-colors mt-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </Button>
                                    </div>

                                <div className="flex flex-col items-center gap-2 pb-4 pt-4 border-t border-black/5 dark:border-white/10">
                                    <div className="flex justify-center gap-4 text-[11px] font-bold tracking-widest uppercase text-foreground/40">
                                        <Link href="/terms" target="_blank" className="hover:text-foreground">Terms</Link>
                                        <Link href="/privacy" target="_blank" className="hover:text-foreground">Privacy</Link>
                                        <Link href="/risk" target="_blank" className="hover:text-foreground">Risk</Link>
                                    </div>
                                    <span className="text-[10px] text-foreground/30 font-medium">© 2026 AutoAlpha</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
