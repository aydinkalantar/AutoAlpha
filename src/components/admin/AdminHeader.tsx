'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type AdminNotification = {
    id: string;
    type: 'SUCCESS' | 'WARNING' | 'CRITICAL';
    message: string;
    isRead: boolean;
    link: string | null;
    createdAt: string;
};

export default function AdminHeader() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
        // Option to poll every 30s
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/admin/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id?: string) => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_read', id }),
            });
            
            setNotifications(prev => prev.map(n => 
                (id === undefined || n.id === id) ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark notification(s) as read:', error);
        }
    };

    const handleNotificationClick = (notification: AdminNotification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
            setIsOpen(false);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'WARNING':
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'CRITICAL':
                return <ShieldAlert className="w-5 h-5 text-red-500" />;
            default:
                return <Bell className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="w-full h-16 bg-white/50 dark:bg-white/5 backdrop-blur-xl border-b border-black/5 dark:border-white/10 flex items-center justify-end px-4 md:px-6 sticky top-0 z-40">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-foreground/70 hover:text-foreground">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white dark:ring-[#0a0a0a]" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[380px] p-0 rounded-2xl shadow-xl border-black/5 dark:border-white/10 bg-white dark:bg-[#1C1C1E] backdrop-blur-2xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
                        <h4 className="font-semibold text-sm">System Notifications</h4>
                        {unreadCount > 0 && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-auto p-1 text-xs text-foreground/50 hover:text-foreground"
                                onClick={() => markAsRead()}
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 px-4 text-foreground/50 text-sm">
                                All systems operational. No new alerts.
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`flex items-start gap-4 p-4 text-left transition-colors border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-foreground/50">
                                                {new Date(notification.createdAt).toLocaleString(undefined, { 
                                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                                                })}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex-shrink-0 flex items-center justify-center w-2 h-2 rounded-full bg-blue-500 self-center" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
