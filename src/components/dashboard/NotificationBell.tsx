"use client";

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead, markAllAsRead } from '@/app/dashboard/actions';
export default function NotificationBell({ userId }: { userId?: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifs = async () => {
        if (!userId) return;
        const notifs = await getUnreadNotifications(userId);
        setNotifications(notifs);
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
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/10"
            >
                <Bell className="w-5 h-5 text-foreground/70 group-hover:text-foreground" />
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                        <h3 className="font-bold text-foreground">Notifications</h3>
                        {notifications.length > 0 && (
                            <button onClick={handleMarkAll} className="text-xs text-foreground/50 hover:text-foreground flex items-center gap-1 font-medium transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Mark all
                            </button>
                        )}
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-foreground/50 text-sm font-medium">
                                No new notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-black/5 dark:divide-white/5">
                                {notifications.map(n => (
                                    <div key={n.id} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{n.title}</p>
                                                <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{n.message}</p>
                                                <span className="text-[10px] uppercase font-bold text-foreground/40 mt-2 block tracking-wider">
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleMarkAsRead(n.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-foreground/40 hover:text-foreground transition-all flex-shrink-0"
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
            )}
        </div>
    );
}
