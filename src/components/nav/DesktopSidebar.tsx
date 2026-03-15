'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, Store, Settings, Wallet, HelpCircle, LogOut, Sun, Moon, Download, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DesktopSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // PWA Installation States
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
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
        // Fallback for iOS handled by MobileMenu or layout if needed, but keeping logic consistent
        if (isIOS) return; 

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                localStorage.setItem('pwaInstalled', 'true');
                setHasInstalled(true);
            }
        }
    };

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Marketplace', href: '/dashboard/market', icon: Store },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="hidden md:flex bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-r border-black/5 dark:border-white/10 h-screen fixed top-0 left-0 flex-col z-50 transition-all w-64">
            <div className="h-20 flex items-center px-4 border-b border-black/5 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-3 w-auto opacity-100 relative">
                    <div className="w-8 h-8 rounded-lg outline-none flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-white font-bold text-[22px] leading-none pb-[2px]">α</span>
                    </div>
                    <span className="font-bold text-lg text-foreground tracking-tight whitespace-nowrap">AutoAlpha</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href);

                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 py-3 px-3 rounded-xl text-sm font-bold transition-all relative group",
                                isActive
                                    ? "bg-foreground text-background shadow-lg shadow-black/10 dark:shadow-white/5"
                                    : "text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-background" : "text-foreground/50")} />
                            <span className="whitespace-nowrap">{item.name}</span>
                        </Link>
                    )
                })}

                {(session?.user as any)?.role === 'ADMIN' && (
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm font-bold transition-all relative group bg-foreground/5 dark:bg-foreground/10 text-foreground hover:bg-black/10 dark:hover:bg-white/10 mt-4 border border-black/5 dark:border-white/5"
                    >
                        <Shield className="w-5 h-5 flex-shrink-0 text-foreground/70" />
                        <span className="whitespace-nowrap">Admin Panel</span>
                    </Link>
                )}
            </nav>

            <div className="pt-4 pb-8 border-t border-black/5 dark:border-white/10 flex flex-col items-center gap-2 shrink-0">
                <div className="w-full flex flex-col gap-2 px-4">
                    <Link href="/dashboard/deposit" className="flex justify-center px-3 items-center gap-3 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 shadow-md shadow-purple-500/20 rounded-xl transition-all w-full">
                        <Wallet className="w-5 h-5 flex-shrink-0" />
                        <span className="whitespace-nowrap">Fund Gas Tank</span>
                    </Link>
                </div>

                {!isStandalone && !hasInstalled && (deferredPrompt) && (
                    <div className="w-full flex flex-col gap-2 px-4">
                        <Button 
                            variant="ghost"
                            onClick={handleInstallClick} 
                            className="flex items-center justify-center px-3 gap-2 py-3 text-sm font-bold bg-foreground text-background rounded-xl shadow-lg shadow-black/10 dark:shadow-white/5 hover:opacity-90 transition-all w-full"
                        >
                            <Download className="w-5 h-5 flex-shrink-0" />
                            <span className="whitespace-nowrap">Install Web App</span>
                        </Button>
                    </div>
                )}

                <div className="w-full h-px bg-black/5 dark:bg-white/10 my-2" />

                <div className="w-full flex flex-col gap-1 px-4">
                    <Link href="/dashboard/academy" className="flex items-center px-3 justify-start gap-3 py-3 h-auto text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full">
                        <HelpCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="whitespace-nowrap font-bold">Support</span>
                    </Link>

                    {mounted && (
                        <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center justify-start px-3 gap-3 py-3 h-auto text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full">
                            {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" /> : <Moon className="w-5 h-5 flex-shrink-0 text-blue-500" />}
                            <span className="whitespace-nowrap font-bold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </Button>
                    )}

                    <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center justify-start gap-3 px-3 py-3 h-auto text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full">
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span className="whitespace-nowrap font-bold">Log Out</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
