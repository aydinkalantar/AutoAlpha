"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function wipeSandboxData() {
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
    // Upsert to ensure one global config exists
    const config = await prisma.systemConfig.upsert({
        where: { id: "global" },
        update: {},
        create: { id: "global" }
    });
    return config;
}

export async function updateSystemConfig(formData: FormData) {
    const stripeMode = formData.get('stripeMode') as string;

    // Test Keys
    const stripeTestPublicKey = formData.get('stripeTestPublicKey') as string | null;
    const stripeTestSecretKey = formData.get('stripeTestSecretKey') as string | null;
    const stripeTestWebhookSecret = formData.get('stripeTestWebhookSecret') as string | null;

    // Live Keys
    const stripeLivePublicKey = formData.get('stripeLivePublicKey') as string | null;
    const stripeLiveSecretKey = formData.get('stripeLiveSecretKey') as string | null;
    const stripeLiveWebhookSecret = formData.get('stripeLiveWebhookSecret') as string | null;

    if (stripeMode !== "TEST" && stripeMode !== "LIVE") {
        throw new Error("Invalid Stripe Mode");
    }

    await prisma.systemConfig.update({
        where: { id: "global" },
        data: {
            stripeMode,
            stripeTestPublicKey: stripeTestPublicKey || null,
            stripeTestSecretKey: stripeTestSecretKey || null,
            stripeTestWebhookSecret: stripeTestWebhookSecret || null,
            stripeLivePublicKey: stripeLivePublicKey || null,
            stripeLiveSecretKey: stripeLiveSecretKey || null,
            stripeLiveWebhookSecret: stripeLiveWebhookSecret || null,
        }
    });

    revalidatePath('/admin/settings');
}
