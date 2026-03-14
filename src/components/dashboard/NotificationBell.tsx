"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCircle2, X } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead, markAllAsRead } from '@/app/dashboard/actions';

export default function NotificationBell({ userId, className }: { userId?: string, className?: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifs = async () => {
        if (!userId) return;
        try {
            const notifs = await getUnreadNotifications(userId);
            setNotifications(notifs);
        } catch (error: any) {
            // If the server action ID changes due to a new deployment, Next.js throws an error.
            if (error?.message?.includes('Server Action') || error?.message?.includes('fetch')) {
                window.location.reload();
            }
        }
    };

    useEffect(() => {
        if (!userId) return;
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 15000); // 15s polling
        return () => clearInterval(interval);
    }, [userId]);

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAll = async () => {
        if (!userId) return;
        await markAllAsRead(userId);
        setNotifications([]);
        setIsOpen(false);
    };

    if (!userId) return null;

    return (
        <div className={`relative z-50 flex items-center justify-center ${className || ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 md:p-2.5 rounded-full text-foreground/80 hover:text-foreground active:scale-95 transition-all md:bg-black/5 md:dark:bg-white/5 md:hover:bg-black/10 md:dark:hover:bg-white/10 md:border md:border-black/5 md:dark:border-white/10 flex items-center justify-center"
            >
                <Bell className="w-6 h-6 md:w-5 md:h-5" />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-2 md:top-2 md:right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background md:border-transparent animate-pulse" />
                )}
            </button>

            {isOpen && (
                <>
                    {/* Full screen backdrop for mobile to dismiss safely */}
                    <div className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    
                    {/* Floating Modal Drawer */}
                    <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 md:mt-2 md:w-96 z-50 bg-background border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                            <h3 className="font-bold text-lg text-foreground">Notifications</h3>
                            <div className="flex items-center gap-3">
                                {notifications.length > 0 && (
                                    <button onClick={handleMarkAll} className="text-sm text-foreground/50 hover:text-foreground flex items-center gap-1.5 font-medium transition-colors">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Mark all
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="md:hidden p-1 rounded-full text-foreground/50 hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto overscroll-contain">
                            {notifications.length === 0 ? (
                                <div className="p-10 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                        <Bell className="w-6 h-6 text-foreground/30" />
                                    </div>
                                    <p className="text-foreground/50 text-sm font-medium">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-black/5 dark:divide-white/5">
                                    {notifications.map(n => (
                                        <div key={n.id} className="p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <p className="font-bold text-base md:text-sm text-foreground">{n.title}</p>
                                                    <p className="text-sm text-foreground/70 mt-1 leading-relaxed">{n.message}</p>
                                                    <span className="text-[10px] uppercase font-bold text-foreground/40 mt-3 block tracking-wider">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    className="opacity-100 md:opacity-0 group-hover:opacity-100 p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground/60 hover:text-foreground transition-all flex-shrink-0"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
