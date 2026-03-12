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
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, usdtBalance: true, usdcBalance: true }
    });
    
    if (!user) redirect("/api/auth/signin");

    return <WithdrawClient userId={user.id} balances={{ usdtBalance: user.usdtBalance, usdcBalance: user.usdcBalance }} />;
}
