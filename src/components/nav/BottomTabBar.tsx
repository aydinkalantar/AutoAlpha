'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BottomTabBar() {
    const pathname = usePathname();

    const bottomBarItems = [
        { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Market', href: '/dashboard/market', icon: Store },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    // Intelligently hide the bottom tab bar on "deep" child pages to maximize chart real estate
    const isDeepPage = pathname.startsWith('/dashboard/market/') || pathname.startsWith('/dashboard/strategy-report');
    if (isDeepPage) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
            <nav className="h-16 w-full flex items-center justify-around px-2">
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
                                : "text-muted-foreground hover:text-foreground/70 active:scale-95"
                        )}
                        style={{ "--mobile-icon-width": "calc(100% / 3 - 8px)" } as any}
                    >
                        <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "")} />
                        <span className="text-[10px] font-medium mt-1">
                            {item.name}
                        </span>
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
