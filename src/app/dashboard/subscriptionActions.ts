"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';



export async function createSubscription(formData: FormData) {
    const userId = formData.get('userId') as string;
    const strategyId = formData.get('strategyId') as string;
    const allocatedCapitalStr = formData.get('allocatedCapital') as string;
    const compoundingEnabled = formData.get('compoundingEnabled') === 'true';
    const currency = formData.get('currency') as string; // 'USDT' or 'USDC'
    const isPaperMode = formData.get('isPaperMode') === 'true';
    const exchange = formData.get('exchange') as any | null;

    const allocatedCapital = parseFloat(allocatedCapitalStr);

    if (!userId || !strategyId || !allocatedCapital || allocatedCapital <= 0) {
        throw new Error('Invalid input for subscription');
    }

    // Use a transaction to deduct the user's free balance and create the virtual wallet subscription
    await prisma.$transaction(async (tx: any) => {
        // 1. Fetch User to check balance
        const user = await tx.user.findUnique({
            where: { id: userId }
        });

        if (!user) throw new Error('User not found');

        let availableBalance = 0;
        if (isPaperMode) {
            availableBalance = currency === 'USDT' ? user.paperUsdtBalance : user.paperUsdcBalance;
        } else {
            availableBalance = currency === 'USDT' ? user.usdtBalance : user.usdcBalance;
        }

        if (availableBalance < allocatedCapital) {
            throw new Error('Insufficient balance');
        }

        // 2. Deduct available balance
        if (isPaperMode) {
            if (currency === 'USDT') {
                await tx.user.update({
                    where: { id: userId },
                    data: { paperUsdtBalance: { decrement: allocatedCapital } }
                });
            } else {
                await tx.user.update({
                    where: { id: userId },
                    data: { paperUsdcBalance: { decrement: allocatedCapital } }
                });
            }
        } else {
            if (currency === 'USDT') {
                await tx.user.update({
                    where: { id: userId },
                    data: { usdtBalance: { decrement: allocatedCapital } }
                });
            } else {
                await tx.user.update({
                    where: { id: userId },
                    data: { usdcBalance: { decrement: allocatedCapital } }
                });
            }
        }

        // 3. Create Subscription (Virtual Wallet)
        await tx.subscription.create({
            data: {
                userId,
                strategyId,
                allocatedCapital,
                currentVirtualBalance: allocatedCapital,
                compoundingEnabled,
                isPaper: isPaperMode,
                exchange: exchange ? exchange : null
            }
        });

        // 4. Write to Ledger for audit
        await tx.ledger.create({
            data: {
                userId,
                amount: -allocatedCapital,
                currency,
                type: 'DEPOSIT',
                isPaper: isPaperMode,
                description: 'Strategy Subscription Deposit'
            }
        });
    });

    revalidatePath('/dashboard');
}

export async function getUserBalances(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { usdtBalance: true, usdcBalance: true }
    });
    return user || { usdtBalance: 0, usdcBalance: 0 };
}

export async function updateSubscriptionCapital(subscriptionId: string, newAllocation: number) {
    if (!subscriptionId || newAllocation < 0) throw new Error('Invalid input');

    await prisma.$transaction(async (tx: any) => {
        const sub = await tx.subscription.findUnique({
            where: { id: subscriptionId },
            include: { strategy: true }
        });
        if (!sub) throw new Error('Subscription not found');

        const user = await tx.user.findUnique({ where: { id: sub.userId } });
        if (!user) throw new Error('User not found');

        const diff = newAllocation - sub.allocatedCapital;
        if (diff === 0) return;

        const currency = sub.strategy.settlementCurrency;
        const isPaperMode = sub.isPaper;

        let availableBalance = 0;
        if (isPaperMode) {
            availableBalance = currency === 'USDT' ? user.paperUsdtBalance : user.paperUsdcBalance;
        } else {
            availableBalance = currency === 'USDT' ? user.usdtBalance : user.usdcBalance;
        }

        if (diff > 0 && availableBalance < diff) {
            throw new Error('Insufficient balance to increase allocation');
        }

        // Adjust User Balance
        if (isPaperMode) {
            if (currency === 'USDT') {
                await tx.user.update({
                    where: { id: user.id },
                    data: { paperUsdtBalance: { decrement: diff } }
                });
            } else {
                await tx.user.update({
                    where: { id: user.id },
                    data: { paperUsdcBalance: { decrement: diff } }
                });
            }
        } else {
            if (currency === 'USDT') {
                await tx.user.update({
                    where: { id: user.id },
                    data: { usdtBalance: { decrement: diff } }
                });
            } else {
                await tx.user.update({
                    where: { id: user.id },
                    data: { usdcBalance: { decrement: diff } }
                });
            }
        }

        // Update Subscription
        await tx.subscription.update({
            where: { id: subscriptionId },
            data: {
                allocatedCapital: newAllocation,
                currentVirtualBalance: { increment: diff }
            }
        });

        // Write Ledger
        await tx.ledger.create({
            data: {
                userId: user.id,
                amount: -diff, // Negative if capital is pulled from free balance (DEPOSIT into strategy)
                currency,
                type: 'DEPOSIT',
                isPaper: isPaperMode,
                description: 'Strategy Allocation Adjustment'
            }
        });
    });

    revalidatePath('/dashboard');
}
