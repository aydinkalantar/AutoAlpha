'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Key, Users, Activity, FileText, Settings, ChevronLeft, ChevronRight, LogOut, Sun, Moon, Megaphone, Terminal, ChevronDown, Monitor } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import * as Accordion from '@radix-ui/react-accordion';
import AdminHeader from './AdminHeader';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminSidebar({ children }: { children?: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Auto-collapse on small screens
    useEffect(() => {
        setMounted(true);
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

    const topLevelNav = { name: 'Command Center', href: '/admin', icon: LayoutDashboard };

    const navGroups = [
        {
            title: 'Users & Finance',
            items: [
                { name: 'Investor CRM', href: '/admin/investors', icon: Users },
                { name: 'Master Ledger', href: '/admin/ledger', icon: FileText }
            ]
        },
        {
            title: 'Trading Engine',
            items: [
                { name: 'Active Strategies', href: '/admin/strategies', icon: Key },
                { name: 'Live Executions', href: '/admin/executions', icon: Activity }
            ]
        },
        {
            title: 'System Health',
            items: [
                { name: 'System Logs', href: '/admin/logs', icon: Terminal }
            ]
        },
        {
            title: 'Growth & Content',
            items: [
                { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
                { name: 'Social Proof', href: '/admin/marketing/social', icon: Activity },
                { name: 'Blog CMS', href: '/admin/marketing/blog', icon: FileText }
            ]
        }
    ];

    const isTopLevelActive = pathname === topLevelNav.href;

    // Determine which groups should be open by default
    const defaultOpenGroups = navGroups
        .filter(group => group.items.some(item => {
            if (item.href === '/admin/marketing') {
                return pathname === item.href;
            }
            return pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        }))
        .map(group => group.title);

    return (
        <>
            {/* Desktop Sidebar (Only visible on md+ since layout handles mobile components) */}
            <div className={cn("hidden md:flex bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-r border-black/5 dark:border-white/10 h-screen fixed top-0 left-0 flex-col z-50 transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
                <div className="h-20 flex items-center justify-between px-4 border-b border-black/5 dark:border-white/10">
                    <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed ? "w-8 opacity-0 pointer-events-none absolute" : "w-auto opacity-100 relative")}>
                        <div className="w-8 h-8 rounded-lg outline-none flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-white font-bold text-[22px] leading-none pb-[2px]">α</span>
                        </div>
                        <span className="font-bold text-lg text-foreground tracking-tight whitespace-nowrap">AutoAlpha</span>
                    </div>

                    {/* Always show the logo icon when collapsed */}
                    {isCollapsed && (
                        <div className="absolute left-6 w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-white font-bold text-[22px] leading-none pb-[2px]">α</span>
                        </div>
                    )}

                    <button onClick={() => setIsCollapsed(!isCollapsed)} className={cn("p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all z-10", isCollapsed ? "absolute -right-3 top-6 bg-background border border-black/5 dark:border-white/10 shadow-sm rounded-full" : "")}>
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 overflow-y-auto overflow-x-hidden no-scrollbar">
                    {/* Command Center (Top Level) */}
                    <Link
                        href={topLevelNav.href}
                        className={cn(
                            "flex items-center gap-3 py-3 rounded-xl text-sm font-bold transition-all relative group mb-6",
                            isCollapsed ? "px-0 justify-center" : "px-3",
                            isTopLevelActive
                                ? "bg-foreground text-background shadow-lg shadow-black/10 dark:shadow-white/5"
                                : "text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                        title={isCollapsed ? topLevelNav.name : undefined}
                    >
                        <topLevelNav.icon className={cn("w-5 h-5 flex-shrink-0", isTopLevelActive ? "text-background" : "text-foreground/50")} />
                        {!isCollapsed && <span className="whitespace-nowrap">{topLevelNav.name}</span>}

                        {/* Tooltip for collapsed mode */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap pointer-events-none">
                                {topLevelNav.name}
                            </div>
                        )}
                    </Link>

                    {/* Navigation Groups */}
                    {isCollapsed ? (
                        <div className="space-y-4">
                            {navGroups.map((group) => (
                                <div key={group.title} className="flex flex-col space-y-2 mb-4">
                                    <div className="w-full h-px bg-black/5 dark:bg-white/10 my-1" />
                                    {group.items.map((item) => {
                                        const isActive = item.href === '/admin/marketing'
                                            ? pathname === item.href
                                            : pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all relative group",
                                                    isActive
                                                        ? "bg-foreground text-background shadow-lg shadow-black/10 dark:shadow-white/5"
                                                        : "text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                                )}
                                                title={item.name}
                                            >
                                                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-background" : "text-foreground/50")} />
                                                <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap pointer-events-none">
                                                    {item.name}
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Accordion.Root type="multiple" defaultValue={defaultOpenGroups} className="space-y-2">
                            {navGroups.map((group) => {
                                const isGroupActive = group.items.some(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)));
                                return (
                                    <Accordion.Item value={group.title} key={group.title} className="flex flex-col space-y-1 mb-2 border-none">
                                        <Accordion.Header className="m-0 p-0">
                                            <Accordion.Trigger
                                                className={cn(
                                                    "flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold transition-all relative group w-full",
                                                    isGroupActive
                                                        ? "bg-foreground/5 text-foreground"
                                                        : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
                                                    "[&[data-state=open]>svg]:rotate-180"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="whitespace-nowrap text-xs uppercase tracking-wider font-bold opacity-80">{group.title}</span>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-foreground/50 transition-transform duration-200" aria-hidden />
                                            </Accordion.Trigger>
                                        </Accordion.Header>

                                        {/* Radix UI sets data-state to open/closed. We can use grid layout trick to animate height to auto securely */}
                                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                            <div className="space-y-1 mt-1">
                                                {group.items.map((item) => {
                                                    const isActive = item.href === '/admin/marketing'
                                                        ? pathname === item.href
                                                        : pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                                    const Icon = item.icon;
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            className={cn(
                                                                "flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-bold transition-all relative group",
                                                                isActive
                                                                    ? "bg-foreground text-background shadow-md shadow-black/10 dark:shadow-white/5"
                                                                    : "text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                                            )}
                                                        >
                                                            <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-background" : "text-foreground/50")} />
                                                            <span className="whitespace-nowrap">{item.name}</span>
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        </Accordion.Content>
                                    </Accordion.Item>
                                );
                            })}
                        </Accordion.Root>
                    )}
                </nav>

                <div className="p-4 border-t border-black/5 dark:border-white/10 flex flex-col gap-2 overflow-hidden shrink-0">
                    <Link href="/admin/settings" className={cn("flex items-center justify-start gap-3 py-3 text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")} title={isCollapsed ? "Admin Settings" : undefined}>
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Admin Settings</span>}
                    </Link>

                    <Link href="/dashboard" className={cn("flex items-center justify-start gap-3 py-3 text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")} title={isCollapsed ? "Exit Admin Mode" : undefined}>
                        <Monitor className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">Exit Admin Mode</span>}
                    </Link>

                    {mounted && (
                        <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={cn("flex items-center justify-start gap-3 py-3 h-auto text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")} title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}>
                            {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0 text-amber-400" /> : <Moon className="w-5 h-5 flex-shrink-0 text-blue-500" />}
                            {!isCollapsed && <span className="whitespace-nowrap font-bold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                        </Button>
                    )}
                    
                    <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/login' })} className={cn("flex items-center justify-start gap-3 py-3 h-auto text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full", isCollapsed ? "justify-center px-0" : "px-3")} title={isCollapsed ? "Log Out" : undefined}>
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap font-bold">Log Out</span>}
                    </Button>
                </div>
            </div>

            <div className={cn("flex-1 flex flex-col min-h-screen w-full md:w-auto max-w-[100vw] md:max-w-none overflow-x-hidden relative z-10 transition-all duration-300 md:pt-0 pb-28 md:pb-0", isCollapsed ? "md:ml-20" : "md:ml-64 lg:ml-64")}>
                <AdminHeader />
                <main className="flex-1 transition-all duration-300 w-full overflow-hidden">
                    {children}
                </main>
            </div>
        </>
    );
}

