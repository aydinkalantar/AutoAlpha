"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';


import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function processCryptoWithdrawal(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error("Unauthorized to perform this action.");
    }
    const userId = (session.user as any).id;
    if (!userId) throw new Error("Unauthorized.");

    const currency = formData.get('currency') as string;
    const amountStr = formData.get('amount') as string;
    const address = formData.get('address') as string;

    const amount = parseFloat(amountStr);
    if (!currency || amount <= 0 || !address) {
        throw new Error('Invalid withdrawal parameters');
    }

    // Very basic simulation of an ERC-20 transfer queuing
    // We deduct the balance immediately, queueing actual send for another worker
    // (Assume BullMQ worker reads from Ledger or separate Withdrawal table)

    await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.findUnique({
            where: { id: userId }
        });

        if (!user) throw new Error('User not found');

        const available = currency === 'USDT' ? user.usdtBalance : user.usdcBalance;
        if (available < amount) {
            throw new Error('Insufficient balance');
        }

        if (currency === 'USDT') {
            await tx.user.update({
                where: { id: userId },
                data: { usdtBalance: { decrement: amount } }
            });
        } else {
            await tx.user.update({
                where: { id: userId },
                data: { usdcBalance: { decrement: amount } }
            });
        }

        await tx.ledger.create({
            data: {
                userId,
                amount: -amount,
                currency,
                description: `Crypto Withdrawal to ${address}`
            }
        });
    });

    revalidatePath('/dashboard');
}

export async function requestFiatRefund() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error("Unauthorized to perform this action.");
    }
    const userId = (session.user as any).id;
    if (!userId) throw new Error("Unauthorized.");

    await prisma.user.update({
        where: { id: userId },
        data: { fiatRefundRequested: true }
    });

    revalidatePath('/dashboard');
}
