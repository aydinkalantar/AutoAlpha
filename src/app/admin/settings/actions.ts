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

export async function wipeSandboxData() {
    await verifyAdmin();
    try {
        await prisma.$transaction([
            prisma.position.deleteMany({ where: { isPaper: true } }),
            prisma.ledger.deleteMany({
                where: {
                    OR: [
                        { description: { contains: 'Simulated', mode: 'insensitive' } },
                        { description: { contains: 'Paper', mode: 'insensitive' } },
                        { description: { contains: 'Sandbox', mode: 'insensitive' } }
                    ]
                }
            }),
            prisma.notification.deleteMany({
                where: {
                    OR: [
                        { message: { contains: 'Simulated', mode: 'insensitive' } },
                        { message: { contains: 'Paper', mode: 'insensitive' } },
                        { message: { contains: 'Sandbox', mode: 'insensitive' } },
                    ]
                }
            })
        ]);
        revalidatePath('/admin', 'layout');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}


export async function getSystemConfig() {
    await verifyAdmin();
    try {
        const config = await prisma.systemConfig.upsert({
            where: { id: "global" },
            update: {},
            create: { id: "global" }
        });
        return config;
    } catch (e) {
        console.warn("Could not fetch system config from database. Returning null.");
        return null;
    }
}

export async function updateSystemConfig(formData: FormData) {
    await verifyAdmin();
    const stripeMode = formData.get('stripeMode') as string;

    // Test Keys
    const stripeTestPublicKey = formData.get('stripeTestPublicKey') as string | null;
    const stripeTestSecretKey = formData.get('stripeTestSecretKey') as string | null;
    const stripeTestWebhookSecret = formData.get('stripeTestWebhookSecret') as string | null;

    // Live Keys
    const stripeLivePublicKey = formData.get('stripeLivePublicKey') as string | null;
    const stripeLiveSecretKey = formData.get('stripeLiveSecretKey') as string | null;
    const stripeLiveWebhookSecret = formData.get('stripeLiveWebhookSecret') as string | null;
    // Welcome Bonus
    const welcomeBonusEnabled = formData.get('welcomeBonusEnabled') === 'true';
    const welcomeBonusAmount = parseFloat(formData.get('welcomeBonusAmount') as string) || 50.0;

    if (stripeMode !== "TEST" && stripeMode !== "LIVE") {
        throw new Error("Invalid Stripe Mode");
    }

    try {
        await prisma.systemConfig.upsert({
            where: { id: "global" },
            update: {
                stripeMode,
                stripeTestPublicKey: stripeTestPublicKey || null,
                stripeTestSecretKey: stripeTestSecretKey || null,
                stripeTestWebhookSecret: stripeTestWebhookSecret || null,
                stripeLivePublicKey: stripeLivePublicKey || null,
                stripeLiveSecretKey: stripeLiveSecretKey || null,
                stripeLiveWebhookSecret: stripeLiveWebhookSecret || null,
                welcomeBonusEnabled,
                welcomeBonusAmount,
            },
            create: {
                id: "global",
                stripeMode,
                stripeTestPublicKey: stripeTestPublicKey || null,
                stripeTestSecretKey: stripeTestSecretKey || null,
                stripeTestWebhookSecret: stripeTestWebhookSecret || null,
                stripeLivePublicKey: stripeLivePublicKey || null,
                stripeLiveSecretKey: stripeLiveSecretKey || null,
                stripeLiveWebhookSecret: stripeLiveWebhookSecret || null,
                welcomeBonusEnabled,
                welcomeBonusAmount,
            }
        });

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (e: any) {
        console.error("Failed to update system config", e);
        return { success: false, error: e.message };
    }
}
