import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
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

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, usdtBalance: true, usdcBalance: true }
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex">
            {/* Dynamic Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 dark:bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge" />
            </div>

            <RealtimeProvider>
                <DashboardSidebar
                    notificationBell={<NotificationBell userId={user?.id} />}
                    userId={user?.id}
                    balances={{ usdtBalance: user?.usdtBalance ?? 0, usdcBalance: user?.usdcBalance ?? 0 }}
                >
                    {children}
                </DashboardSidebar>
            </RealtimeProvider>
        </div>
    );
}
