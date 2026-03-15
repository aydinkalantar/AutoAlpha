'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AdminBottomBar({ isMobileMenuOpen, setIsMobileMenuOpen }: { isMobileMenuOpen: boolean, setIsMobileMenuOpen: (val: boolean) => void }) {
    const pathname = usePathname();

    const bottomBarItems = [
        { name: 'Command', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/investors', icon: Users },
        { name: 'Activity', href: '/admin/executions', icon: Activity },
    ];

    // Find the most specific active item
    const activeItem = bottomBarItems.reduce((acc, item) => {
        if (item.href === '/admin') {
            return pathname === '/admin' ? item : acc;
        }
        if (pathname.startsWith(item.href)) {
            if (!acc || item.href.length > acc.href.length) {
                return item;
            }
        }
        return acc;
    }, null as typeof bottomBarItems[0] | null);

    return (
        <div className="md:hidden flex fixed bottom-0 left-0 w-full z-50 border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            <nav className="h-16 w-full flex items-center justify-around px-2">
                {bottomBarItems.map((item) => {
                    const isActive = !isMobileMenuOpen && activeItem?.href === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-[calc(33vw-12px)] h-12 rounded-2xl transition-all duration-300",
                                isActive
                                    ? "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20"
                                    : "text-muted-foreground hover:text-foreground/70 active:scale-95"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "")} />
                            <span className="text-[10px] font-medium mt-1">
                                {item.name}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="adminMobileNavIndicator"
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
