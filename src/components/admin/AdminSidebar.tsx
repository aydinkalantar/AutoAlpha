'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Key, Users, Activity, FileText, Settings, ChevronLeft, ChevronRight, LogOut, Sun, Moon, Megaphone, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminSidebar({ children }: { children?: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // PWA Installation States
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [hasInstalled, setHasInstalled] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check if already installed
        if (typeof window !== 'undefined') {
            if (localStorage.getItem('pwaInstalled') === 'true') {
                setHasInstalled(true);
            }
        }

        const _isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        setIsStandalone(_isStandalone);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Capture Chrome/Android native install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            localStorage.setItem('pwaInstalled', 'true');
            setHasInstalled(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSModal(true);
            setIsMobileMenuOpen(false);
            return;
        }
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                localStorage.setItem('pwaInstalled', 'true');
                setHasInstalled(true);
            }
            setIsMobileMenuOpen(false);
        }
    };

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
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
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Strategy Command', href: '/admin/strategies', icon: Key },
        { name: 'Investor CRM', href: '/admin/investors', icon: Users },
        { name: 'Live Executions', href: '/admin/executions', icon: Activity },
        { name: 'Master Ledger', href: '/admin/ledger', icon: FileText },
        { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
        { name: 'Social Proof', href: '/admin/marketing/social', icon: Activity },
        { name: 'Blog CMS', href: '/admin/marketing/blog', icon: FileText },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    // Find the most specific active item
    const activeItem = navItems.reduce((acc, item) => {
        if (item.href === '/admin') {
            return pathname === '/admin' ? item : acc;
        }
        if (pathname.startsWith(item.href)) {
            if (!acc || item.href.length > acc.href.length) {
                return item;
            }
        }
        return acc;
    }, null as typeof navItems[0] | null);

    // Split nav items for mobile
    const bottomBarItems = navItems.filter(item => ['Overview', 'Strategy Command', 'Investor CRM', 'Live Executions'].includes(item.name));
    const drawerItems = navItems.filter(item => !['Overview', 'Strategy Command', 'Investor CRM', 'Live Executions'].includes(item.name));

    return (
        <>
            {/* Mobile Top Header */}
            <div className="flex md:hidden fixed top-0 w-full h-16 z-[60] px-4 justify-between items-center bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/10 transition-transform duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg outline-none flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <div className="w-3 h-3 bg-white rounded-sm transform rotate-45" />
                    </div>
                    <span className="font-bold text-lg text-foreground tracking-tight">Admin Console</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-foreground/80 hover:text-foreground active:scale-95 transition-all"
                        aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
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
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className={cn("p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all z-10", isCollapsed ? "absolute -right-3 top-6 bg-background border border-black/5 dark:border-white/10 shadow-sm rounded-full" : "")}>
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive = activeItem?.href === item.href;

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
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap pointer-events-none">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-black/5 dark:border-white/10 flex flex-col gap-2 overflow-hidden shrink-0">
                    {/* Desktop Web App Install Button */}
                    {!isStandalone && !hasInstalled && (deferredPrompt || isIOS) && (
                        <div className="w-full flex flex-col gap-2 mb-2">
                            <Button 
                                variant="ghost"
                                onClick={handleInstallClick} 
                                className={cn("flex items-center justify-center gap-2 py-3 text-sm font-bold bg-foreground text-background rounded-xl shadow-lg shadow-black/10 dark:shadow-white/5 hover:opacity-90 transition-all w-full", isCollapsed ? "px-0" : "px-3")}
                            >
                                <Download className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span className="whitespace-nowrap">Install Web App</span>}
                            </Button>
                        </div>
                    )}

                    <div className="w-full h-px bg-black/5 dark:bg-white/10 mb-1" />

                    <Link href="/dashboard" className={cn("flex items-center justify-start gap-3 py-3 text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Back to App</span>}
                    </Link>
                    {mounted && (
                        <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={cn("flex items-center justify-start gap-3 py-3 h-auto text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                            {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" /> : <Moon className="w-5 h-5 flex-shrink-0 text-blue-500" />}
                            {!isCollapsed && <span className="whitespace-nowrap font-bold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                        </Button>
                    )}
                    <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/login' })} className={cn("flex items-center justify-start gap-3 py-3 h-auto text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")}>
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap font-bold">Log Out</span>}
                    </Button>
                </div>
            </div>

            <div className={cn("flex-1 flex flex-col min-h-screen w-full md:w-auto max-w-[100vw] md:max-w-none overflow-x-hidden relative z-10 transition-all duration-300 pt-20 pb-28 md:pt-0 md:pb-0", isCollapsed ? "md:ml-20" : "md:ml-64 lg:ml-64")}>
                <main className="flex-1 transition-all duration-300 w-full overflow-hidden">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation (Floating Pill) */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <nav className="h-16 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[2rem] flex items-center justify-around px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                {bottomBarItems.map((item) => {
                    const isActive = !isMobileMenuOpen && activeItem?.href === item.href;

                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-[calc(20vw-12px)] h-12 rounded-2xl transition-all duration-300",
                                isActive
                                    ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                                    : "text-foreground/40 hover:text-foreground/70 active:scale-95"
                            )}
                        >
                            <Icon className={cn("w-5.5 h-5.5 transition-transform duration-300", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "")} />
                            {isActive && (
                                <motion.div
                                    layoutId="adminMobileNavIndicator"
                                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400"
                                />
                            )}
                        </Link>
                    );
                })}
                
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-[calc(20vw-12px)] h-12 rounded-2xl transition-all duration-300",
                        isMobileMenuOpen
                            ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                            : "text-foreground/40 hover:text-foreground/70 active:scale-95"
                    )}
                    aria-label="Settings"
                >
                    <Settings className={cn("w-5.5 h-5.5 transition-transform duration-300", isMobileMenuOpen ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "")} />
                    {isMobileMenuOpen && (
                        <motion.div
                            layoutId="adminMobileNavIndicator"
                            className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400"
                        />
                    )}
                </button>
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
                            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                        >
                            {/* Drag Indicator */}
                            <div className="w-full h-8 flex items-center justify-center shrink-0 cursor-pointer" 
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full" />
                            </div>

                            <div className="flex-1 overflow-y-auto pb-28 px-6 no-scrollbar touch-pan-y shadow-[inset_0_40px_40px_-40px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_40px_40px_-40px_rgba(0,0,0,0.2)]">
                                
                                <div className="pb-6 pt-2">
                                    <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">Admin Menu</h3>
                                    <p className="text-sm text-foreground/50 font-medium">AutoAlpha Command Center.</p>
                                </div>

                                <div className="space-y-2 mb-8">
                                    {drawerItems.map((item) => {
                                        const isActive = activeItem?.href === item.href;
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
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("p-2 rounded-xl", isActive ? "bg-background/20" : "bg-black/5 dark:bg-white/10")}>
                                                        <Icon className={cn("w-5 h-5", isActive ? "text-background" : "text-foreground")} />
                                                    </div>
                                                    <span className="font-bold text-lg">{item.name}</span>
                                                </div>
                                                <ChevronRight className={cn("w-5 h-5", isActive ? "text-background/50" : "text-foreground/30")} />
                                            </Link>
                                        )
                                    })}
                                </div>

                                <div className="h-px w-full bg-black/5 dark:bg-white/10 mb-8" />

                                <div className="space-y-4 mb-8">
                                    <h4 className="text-xs font-bold tracking-widest uppercase text-foreground/40 px-2">Preferences</h4>

                                    {/* Web App Install Button (Only show if not installed and prompt is available) */}
                                    {!isStandalone && !hasInstalled && (deferredPrompt || isIOS) && (
                                        <Button 
                                            variant="ghost"
                                            onClick={handleInstallClick} 
                                            className="w-full h-auto flex items-center justify-between p-4 px-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 text-foreground transition-colors rounded-[2rem] mb-6 border border-cyan-500/20"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                                                    <Download className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-base font-bold tracking-tight">Install Admin Toolkit</span>
                                                    <span className="text-xs text-foreground/60 font-medium tracking-tight">Pro performance. Zero effort.</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-foreground/30" />
                                        </Button>
                                    )}

                                    <h4 className="text-xs font-bold tracking-widest uppercase text-foreground/40 px-2 mt-4">Quick Actions</h4>
                                    
                                    <Link href="/dashboard" className="w-full flex items-center justify-center gap-3 py-4 text-sm font-bold text-foreground bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/15 dark:active:bg-white/15 rounded-2xl transition-colors mt-2">
                                        <LayoutDashboard className="w-5 h-5" />
                                        Back to App
                                    </Link>

                                    <div className="grid grid-cols-1 gap-3">
                                        {mounted && (
                                            <button 
                                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                                                className="flex items-center justify-center gap-3 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/15 dark:active:bg-white/15 rounded-2xl transition-colors"
                                            >
                                                <div className="p-2 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm">
                                                    {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-500" />}
                                                </div>
                                                <span className="text-xs font-bold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                            </button>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => signOut({ callbackUrl: '/login' })} 
                                        className="w-full flex items-center justify-center gap-3 py-4 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-500/10 active:bg-red-100 dark:active:bg-red-500/20 rounded-2xl transition-colors mt-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Log Out
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* iOS Installation Instructions Modal */}
            <AnimatePresence>
                {showIOSModal && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4 pb-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setShowIOSModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden pb-8 sm:pb-0 z-10"
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <button 
                                    onClick={() => setShowIOSModal(false)}
                                    className="p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-colors"
                                    aria-label="Close iOS Install Modal"
                                >
                                    <X className="w-5 h-5 text-foreground/60" />
                                </button>
                            </div>

                            <div className="p-8 pb-6 flex flex-col items-center text-center bg-gradient-to-b from-black/5 dark:from-white/5 to-transparent">
                                <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30 mb-6 border border-black/10 dark:border-white/10">
                                    <div className="w-6 h-6 bg-white rounded-md transform rotate-45" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">Install Admin Toolkit</h2>
                                <p className="text-foreground/60 text-sm font-medium">Install the control center on your home screen for quick and easy access when you're on the go.</p>
                            </div>

                            <div className="px-8 pb-8 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-sm font-bold text-foreground">1</span>
                                    </div>
                                    <div>
                                        <p className="text-base text-foreground font-medium mb-1">Tap the Share button</p>
                                        <p className="text-sm text-foreground/50">Look for the square with an arrow pointing up at the bottom of your screen.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-sm font-bold text-foreground">2</span>
                                    </div>
                                    <div>
                                        <p className="text-base text-foreground font-medium mb-1">Scroll down and tap</p>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/10 rounded-lg border border-black/10 dark:border-white/10">
                                            <span className="text-sm font-bold text-foreground">Add to Home Screen</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-sm font-bold text-foreground">3</span>
                                    </div>
                                    <div>
                                        <p className="text-base text-foreground font-medium mb-1">Confirm installation</p>
                                        <p className="text-sm text-foreground/50">Tap "Add" in the top right corner to finish.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 pt-0">
                                <button 
                                    onClick={() => setShowIOSModal(false)}
                                    className="w-full py-4 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground font-bold text-base transition-colors"
                                >
                                    Got it, thanks
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
