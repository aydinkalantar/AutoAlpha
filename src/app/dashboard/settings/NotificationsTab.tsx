import NotificationSettings from './NotificationSettings';

export default function NotificationsTab({ user }: { user: any }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative z-10 space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b border-black/10 dark:border-white/10 pb-2 mb-4">Notification Preferences</h3>
                <div className="grid md:w-1/2">
                    <NotificationSettings initialEnabled={user.tradeEmailNotifications ?? true} />
                </div>
            </div>
            
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 max-w-2xl shadow-xl mt-8">
                <h4 className="font-bold text-lg mb-2 text-foreground">Future Preferences (Coming Soon)</h4>
                <p className="text-foreground/60 text-sm mb-4">We are hard at work building push notifications, Telegram bot webhooks, and SMS alerts.</p>
                <div className="opacity-50 pointer-events-none space-y-4">
                     <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 flex justify-between items-center">
                         <div>
                             <p className="font-medium text-foreground text-sm">Low Gas Warning</p>
                             <p className="text-xs text-foreground/50">Alert when prepaid gas drops below $10</p>
                         </div>
                         <div className="w-10 h-6 bg-black/10 rounded-full"></div>
                     </div>
                </div>
            </div>
        </div>
    );
}
