'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BottomTabBar() {
    const pathname = usePathname();

    const bottomBarItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Marketplace', href: '/dashboard/market', icon: Store },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    // Intelligently hide the bottom tab bar on "deep" child pages to maximize chart real estate
    const isDeepPage = pathname.startsWith('/dashboard/market/') || pathname.startsWith('/dashboard/strategy-report');
    if (isDeepPage) return null;

    return (
        <div className="md:hidden fixed left-4 right-4 z-[99999]" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            <nav className="h-16 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[2rem] flex items-center justify-around px-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            {bottomBarItems.map((item) => {
                const isActive = item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);

                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "relative flex flex-col items-center justify-center w-[var(--mobile-icon-width)] h-12 rounded-2xl transition-all duration-300",
                            isActive
                                ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                                : "text-foreground/40 hover:text-foreground/70 active:scale-95"
                        )}
                        style={{ "--mobile-icon-width": "calc(100% / 3 - 8px)" } as any}
                    >
                        <Icon className={cn("w-5.5 h-5.5 transition-transform duration-300", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "")} />
                        {isActive && (
                            <motion.div
                                layoutId="bottomNavIndicator"
                                className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400"
                            />
                        )}
                    </Link>
                );
            })}
            </nav>
        </div>
    );
}
