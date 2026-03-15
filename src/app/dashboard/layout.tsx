import DesktopSidebar from '@/components/nav/DesktopSidebar';
import MobileMenu from '@/components/nav/MobileMenu';
import BottomTabBar from '@/components/nav/BottomTabBar';
import NotificationBell from '@/components/dashboard/NotificationBell';
import RealtimeProvider from '@/components/dashboard/RealtimeProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    if (!userId) {
        redirect("/login");
    }

    let user: any = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, usdtBalance: true, usdcBalance: true }
        });
    } catch (e) {
        console.warn("Could not fetch user balances from database. Using default 0 balances.");
        user = { id: userId, usdtBalance: 0, usdcBalance: 0 };
    }

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative flex w-full">
            {/* Dynamic Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 dark:bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge" />
            </div>

            <RealtimeProvider>
                <DesktopSidebar />
                <MobileMenu notificationBell={<NotificationBell userId={user.id} />} />
                
                <div className="flex-1 flex flex-col min-h-screen w-full md:w-auto max-w-[100vw] md:max-w-none overflow-x-hidden relative z-10 transition-all duration-300 pt-20 pb-28 md:pt-0 md:pb-0 md:ml-64">
                    <main className="flex-1 transition-all duration-300 w-full">
                        {children}
                    </main>
                </div>

                <BottomTabBar />
            </RealtimeProvider>
        </div>
    );
}
