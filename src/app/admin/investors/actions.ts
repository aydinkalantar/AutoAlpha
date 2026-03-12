"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required.");
    }
    return session;
}

export async function getUsers() {
    await verifyAdmin();
    return await prisma.user.findMany({
        include: {
            exchangeKeys: true,
            subscriptions: true,
            ledgers: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function updateUserStatus(userId: string, isActive: boolean) {
    await verifyAdmin();
    if (!userId) throw new Error('Invalid user ID');

    await prisma.user.update({
        where: { id: userId },
        data: { isActive }
    });

    revalidatePath('/admin/investors');
}

export async function adjustBalance(formData: FormData) {
    await verifyAdmin();
    const userId = formData.get('userId') as string;
    const currency = formData.get('currency') as string;
    const type = formData.get('type') as 'CREDIT' | 'DEBIT';
    const amountStr = formData.get('amount') as string;
    const description = formData.get('description') as string;

    const amount = parseFloat(amountStr);
    if (!userId || !currency || !type || amount <= 0 || !description) {
        throw new Error('Invalid input for balance adjustment');
    }

    const adjustment = type === 'DEBIT' ? -amount : amount;

    await prisma.$transaction(async (tx: any) => {
        // 1. Update User Balance
        if (currency === 'USDT') {
            await tx.user.update({
                where: { id: userId },
                data: { usdtBalance: { increment: adjustment } }
            });
        } else if (currency === 'USDC') {
            await tx.user.update({
                where: { id: userId },
                data: { usdcBalance: { increment: adjustment } }
            });
        } else {
            throw new Error('Unsupported currency');
        }

        // 2. Write to Ledger
        await tx.ledger.create({
            data: {
                userId,
                amount: adjustment,
                currency,
                description: `Admin ${type}: ${description}`
            }
        });
    });
}
