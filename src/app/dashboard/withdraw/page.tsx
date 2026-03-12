import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import WithdrawClient from './WithdrawClient';

export const dynamic = 'force-dynamic';

export default async function WithdrawPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/api/auth/signin");
    
    const userId = (session.user as any).id;
    let user: any = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, usdtBalance: true, usdcBalance: true }
        });
    } catch (e) {
        console.warn("Could not fetch user balances from database. Returning default 0.");
        user = { id: userId, usdtBalance: 0, usdcBalance: 0 };
    }
    
    if (!user) redirect("/api/auth/signin");

    return <WithdrawClient userId={user.id} balances={{ usdtBalance: user.usdtBalance, usdcBalance: user.usdcBalance }} />;
}
