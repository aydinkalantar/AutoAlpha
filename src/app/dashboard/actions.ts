"use server";

import { PrismaClient, SupportedExchange } from '@prisma/client';
import { encryptKey } from '@/lib/encryption';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';


export async function saveApiKey(formData: FormData) {
    const userId = formData.get('userId') as string;
    const exchange = formData.get('exchange') as SupportedExchange;
    const apiKey = formData.get('apiKey') as string;
    const apiSecret = formData.get('apiSecret') as string;
    const isTestnet = formData.get('isTestnet') === 'on';

    if (!userId || !exchange || !apiKey || !apiSecret) {
        throw new Error('Missing required fields');
    }

    const encryptedKeyRaw = encryptKey(apiKey, process.env.MASTER_ENCRYPTION_KEY!);
    const encryptedSecretRaw = encryptKey(apiSecret, process.env.MASTER_ENCRYPTION_KEY!);

    // Deactivate any existing key for this exchange
    await prisma.exchangeKey.updateMany({
        where: { userId, exchange },
        data: { isValid: false }
    });

    await prisma.exchangeKey.create({
        data: {
            userId,
            exchange,
            encryptedApiKey: encryptedKeyRaw,
            encryptedSecret: encryptedSecretRaw,
            iv: encryptedKeyRaw.split(':')[0],  // Store GCM IV strictly to satisfy Prisma schema
            isValid: true,
            isTestnet
        }
    });

    revalidatePath('/dashboard');
}

export async function getActiveStrategies() {
    return await prisma.strategy.findMany({
        where: { isActive: true }
    });
}

export async function deleteApiKey(keyId: string) {
    if (!keyId) throw new Error("Key ID required");

    await prisma.exchangeKey.update({
        where: { id: keyId },
        data: { isValid: false }
    });

    revalidatePath('/dashboard');
}

export async function mockDeposit(formData: FormData) {
    const userId = formData.get('userId') as string;
    const amountStr = formData.get('amount') as string;
    const currency = formData.get('currency') as string;
    const amount = parseFloat(amountStr);

    if (!userId || amount <= 0 || !currency) {
        throw new Error("Invalid deposit parameters");
    }

    try {
        await prisma.$transaction(async (tx: any) => {
            if (currency === 'USDT') {
                await tx.user.update({
                    where: { id: userId },
                    data: { usdtBalance: { increment: amount } }
                });
            } else if (currency === 'USDC') {
                await tx.user.update({
                    where: { id: userId },
                    data: { usdcBalance: { increment: amount } }
                });
            }

            await tx.ledger.create({
                data: {
                    userId,
                    amount,
                    currency,
                    description: "Sandbox Mock Deposit"
                }
            });
        });
    } catch (e: any) {
        console.warn("Database offline: Could not mock deposit.", e.message);
    }
    revalidatePath('/dashboard');
}

export async function getUnreadNotifications(userId: string) {
    try {
        return await prisma.notification.findMany({
            where: { userId, isRead: false },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    } catch (e) {
        console.warn("Database offline: returning empty notifications array.");
        return [];
    }
}

export async function markNotificationAsRead(id: string) {
    try {
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
    } catch (e) {
        console.warn("Database offline: skipped marking notification as read.");
    }
    revalidatePath('/dashboard');
    return true;
}

export async function markAllAsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    } catch (e) {
        console.warn("Database offline: skipped marking all notifications as read.");
    }
    revalidatePath('/dashboard');
    return true;
}

export async function toggleTestnetMode(userId: string, isTestnetMode: boolean) {
    if (!userId) throw new Error("Unauthorized");

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isTestnetMode }
        });
    } catch (error) {
        console.warn("Database offline: Could not toggle testnet mode permanently.");
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
}

export async function resetPaperCapital(userId: string) {
    if (!userId) throw new Error("Unauthorized");

    try {
        await prisma.$transaction(async (tx) => {
            // Reset balances
            await tx.user.update({
                where: { id: userId },
                data: {
                    paperUsdtBalance: 10000.0,
                    paperUsdcBalance: 10000.0
                }
            });

        // Close all open paper positions
        await tx.position.updateMany({
            where: { userId, isPaper: true, isOpen: true },
            data: { isOpen: false, exitPrice: 0 }
        });

        // Add a ledger entry
        await tx.ledger.create({
            data: {
                userId,
                amount: 20000.0,
                currency: 'USDT',
                type: 'DEPOSIT',
                description: 'Paper Capital Manual Reset'
            }
        });
    });
    } catch (error) {
        console.warn("Database offline: Could not reset paper capital.");
    }
    revalidatePath('/dashboard');
}

export async function completeOnboarding(userId: string) {
    if (!userId) throw new Error("Unauthorized");

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { hasCompletedOnboarding: true }
        });
    } catch (e) {
        console.warn("Could not update onboarding status in database.");
    }

    revalidatePath('/dashboard');
}
