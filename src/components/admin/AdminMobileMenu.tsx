'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Key, FileText, Settings, ChevronRight, LogOut, Sun, Moon, Megaphone, Download, Menu, X, Terminal, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminMobileMenu({ isMobileMenuOpen, setIsMobileMenuOpen }: { isMobileMenuOpen: boolean, setIsMobileMenuOpen: (val: boolean) => void }) {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // PWA Installation States
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [hasInstalled, setHasInstalled] = useState(false);

    useEffect(() => {
        setMounted(true);

        if (typeof window !== 'undefined') {
            if (localStorage.getItem('pwaInstalled') === 'true') {
                setHasInstalled(true);
            }
        }

        const _isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        setIsStandalone(_isStandalone);

        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

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

    const drawerItems = [
        { name: 'Active Strategies', href: '/admin/strategies', icon: Key },
        { name: 'Master Ledger', href: '/admin/ledger', icon: FileText },
        { name: 'System Logs', href: '/admin/logs', icon: Terminal },
        { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
        { name: 'Social Proof', href: '/admin/marketing/social', icon: Activity }, // Assuming Activity icon for this since not defined strictly
        { name: 'Blog CMS', href: '/admin/marketing/blog', icon: FileText },
    ];

    const activeItem = drawerItems.reduce((acc, item) => {
        if (pathname.startsWith(item.href)) {
            if (!acc || item.href.length > acc.href.length) {
                return item;
            }
        }
        return acc;
    }, null as typeof drawerItems[0] | null);

    return (
        <>
            {/* Mobile Top Header */}
            <div className="flex md:hidden fixed top-0 w-full h-16 z-[60] px-4 justify-between items-center bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/10 transition-transform duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg outline-none flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-white font-bold text-lg leading-none pb-[2px]">α</span>
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
                            className="md:hidden fixed bottom-16 left-0 right-0 h-[85vh] z-[45] bg-white/95 dark:bg-[#121214]/95 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden will-change-transform"
                        >
                            {/* Drag Indicator */}
                            <div className="w-full h-8 flex items-center justify-center shrink-0 cursor-pointer" 
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full" />
                            </div>

                            <div className="flex-1 overflow-y-auto pb-6 px-6 no-scrollbar touch-pan-y shadow-[inset_0_40px_40px_-40px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_40px_40px_-40px_rgba(0,0,0,0.2)]">
                                
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

                                    {/* Web App Install Button */}
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

                                    <h4 className="text-xs font-bold tracking-widest uppercase text-foreground/40 px-2 mt-4">Utilities</h4>
                                    
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <Link 
                                            href="/admin/settings" 
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex flex-col items-center justify-center gap-2 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/15 dark:active:bg-white/15 rounded-2xl transition-colors"
                                        >
                                            <Settings className="w-6 h-6 text-foreground/70" />
                                            <span className="text-xs font-bold">Admin Settings</span>
                                        </Link>

                                        {mounted && (
                                            <button 
                                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                                                className="flex flex-col items-center justify-center gap-2 p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/15 dark:active:bg-white/15 rounded-2xl transition-colors"
                                            >
                                                {theme === 'dark' ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-blue-500" />}
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
                                    <span className="text-white font-bold text-4xl leading-none pb-2">α</span>
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
