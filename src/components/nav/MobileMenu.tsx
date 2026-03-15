'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Menu, X, Wallet, FileText, Settings, ChevronLeft, HelpCircle, Sun, Moon, Volume2, VolumeX, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtime } from '@/components/dashboard/RealtimeProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MobileMenu({ notificationBell }: { notificationBell?: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isSoundEnabled, toggleSound } = useRealtime();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        { name: 'Settings & Preferences', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <>
            <div className="flex md:hidden fixed top-0 w-full h-16 z-[60] px-4 justify-between items-center bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/10">
                <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2 active:scale-95 transition-transform"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div className="w-8 h-8 rounded-lg outline-none flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-white font-bold text-[22px] leading-none pb-[2px]">α</span>
                    </div>
                    <span className="font-bold text-lg text-foreground tracking-tight">AutoAlpha</span>
                </Link>
                <div className="flex items-center gap-1">
                    {notificationBell}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-foreground/80 hover:text-foreground active:scale-95 transition-all"
                        aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="md:hidden fixed inset-0 z-[65] bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%", opacity: 0.8 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0.8 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="md:hidden fixed bottom-0 left-0 right-0 h-[85vh] z-[70] bg-white/95 dark:bg-[#121214]/95 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden will-change-transform"
                            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                        >
                            {/* Drag Indicator */}
                            <div className="w-full h-8 flex items-center justify-center shrink-0 cursor-pointer" 
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full" />
                            </div>

                            <div className="flex-1 overflow-y-auto pb-4 px-6 no-scrollbar touch-pan-y shadow-[inset_0_40px_40px_-40px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_40px_40px_-40px_rgba(0,0,0,0.2)]">
                                
                                <div className="flex items-center justify-between pb-6 pt-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">Menu</h3>
                                        <p className="text-sm text-foreground/50 font-medium">Access your account, settings, and more.</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-foreground/60" />
                                    </button>
                                </div>

                                <Link href="/dashboard/deposit" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-3 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-2xl shadow-lg shadow-purple-500/20 transition-all mb-6">
                                    <Wallet className="w-5 h-5 flex-shrink-0" />
                                    <span>Fund Gas Tank</span>
                                </Link>

                                <div className="bg-black/5 dark:bg-white/5 rounded-[2rem] overflow-hidden mb-8">
                                    {drawerItems.map((item, index) => {
                                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                        const Icon = item.icon;
                                        const isLast = index === drawerItems.length - 1;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={cn(
                                                    "flex items-center justify-between p-4 px-5 transition-colors active:bg-black/10 dark:active:bg-white/10",
                                                    isActive ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/5 dark:hover:bg-white/5",
                                                    !isLast && "border-b border-black/5 dark:border-white/5"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("p-2 rounded-xl flex items-center justify-center transition-colors", isActive ? "bg-foreground text-background shadow-md shadow-black/10 dark:shadow-white/10" : "bg-black/5 dark:bg-white/10 text-foreground/70")}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <span className={cn("text-base tracking-tight", isActive ? "font-bold text-foreground" : "font-medium text-foreground/80")}>{item.name}</span>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>

                                {/* Footer Icon Row */}
                                <div className="flex items-center justify-between px-2 bg-black/5 dark:bg-white/5 p-4 rounded-3xl mt-auto">
                                    <Link href="/dashboard/academy" onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-background/50 hover:bg-background rounded-2xl text-foreground/60 hover:text-foreground transition-colors" title="Support">
                                        <HelpCircle className="w-6 h-6" />
                                    </Link>
                                    
                                    {mounted && (
                                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 bg-background/50 hover:bg-background rounded-2xl text-foreground/60 hover:text-foreground transition-colors" title="Toggle Theme">
                                            {theme === 'dark' ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-blue-500" />}
                                        </button>
                                    )}

                                    <button onClick={toggleSound} className="p-3 bg-background/50 hover:bg-background rounded-2xl text-foreground/60 hover:text-foreground transition-colors" title="Toggle Sound">
                                        {isSoundEnabled ? <Volume2 className="w-6 h-6 text-foreground" /> : <VolumeX className="w-6 h-6 text-foreground/50" />}
                                    </button>

                                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-500 transition-colors" title="Log Out">
                                        <LogOut className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
