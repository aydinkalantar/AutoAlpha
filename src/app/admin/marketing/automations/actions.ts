'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getZombieCampaignConfig() {
    return await prisma.systemConfig.findUnique({
        where: { id: 'global' }
    });
}

export async function getZombieEmailsSentCount() {
    return await prisma.user.count({
        where: {
            zombieEmailSentAt: {
                not: null
            }
        }
    });
}

export async function updateZombieCampaignConfig(formData: FormData) {
    const enabled = formData.get('zombieCampaignEnabled') === 'true';
    const triggerDaysStr = formData.get('zombieTriggerDays');
    const triggerDays = triggerDaysStr ? parseInt(triggerDaysStr as string, 10) : 3;

    if (isNaN(triggerDays) || triggerDays < 1) {
        throw new Error("Trigger days must be a valid positive number.");
    }

    await prisma.systemConfig.upsert({
        where: { id: 'global' },
        update: {
            zombieCampaignEnabled: enabled,
            zombieTriggerDays: triggerDays,
        },
        create: {
            id: 'global',
            zombieCampaignEnabled: enabled,
            zombieTriggerDays: triggerDays,
        }
    });

    revalidatePath('/admin/marketing/automations');
}
