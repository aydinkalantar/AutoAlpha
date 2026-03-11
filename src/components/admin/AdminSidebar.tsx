'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Key, Users, Activity, FileText, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminSidebar({ children }: { children?: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Strategy Command', href: '/admin/strategies', icon: Key },
        { name: 'Investor CRM', href: '/admin/investors', icon: Users },
        { name: 'Live Executions', href: '/admin/executions', icon: Activity },
        { name: 'Master Ledger', href: '/admin/ledger', icon: FileText },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <>
            <div className={cn("bg-white/50 dark:bg-black/40 backdrop-blur-2xl border-r border-black/5 dark:border-white/10 h-screen fixed top-0 left-0 flex flex-col z-50 transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
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
                        const isActive = item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(item.href);

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

                <div className="p-4 border-t border-black/5 dark:border-white/10 flex flex-col gap-2 overflow-hidden">
                    <Link href="/dashboard" className={cn("flex items-center justify-center gap-2 py-2 text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "px-0" : "px-3")}>
                        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Back to App</span>}
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className={cn("flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full", isCollapsed ? "px-0" : "px-3")}>
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Log Out</span>}
                    </button>
                </div>
            </div>

            <div className={cn("flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-300", isCollapsed ? "ml-20" : "ml-64 lg:ml-64")}>
                <main className="flex-1 p-8 md:p-12 transition-all duration-300 w-full overflow-hidden">
                    {children}
                </main>
            </div>
        </>
    );
}
