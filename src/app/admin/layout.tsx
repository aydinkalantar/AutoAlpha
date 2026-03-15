import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileWrapper from '@/components/admin/AdminMobileWrapper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden flex w-full">
            {/* Dynamic Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 dark:bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge" />
            </div>

            <AdminMobileWrapper />
            <AdminSidebar>
                {children}
            </AdminSidebar>
        </div>
    );
}
