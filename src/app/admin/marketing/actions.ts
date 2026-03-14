"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getMarketingConfig() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    let config = await prisma.systemConfig.findFirst();
    if (!config) {
        config = await prisma.systemConfig.create({ data: {} });
    }
    return config;
}

export async function updateMarketingConfig(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const config = await prisma.systemConfig.findFirst();
    if (!config) {
        throw new Error('System config not found');
    }

    const welcomeBonusEnabled = formData.get('welcomeBonusEnabled') === 'true';
    const welcomeBonusAmountStr = formData.get('welcomeBonusAmount');
    let welcomeBonusAmount = 0;
    if (welcomeBonusAmountStr) {
        welcomeBonusAmount = parseFloat(welcomeBonusAmountStr.toString());
        if (isNaN(welcomeBonusAmount) || welcomeBonusAmount < 0) {
            welcomeBonusAmount = 0;
        }
    }

    const affiliateCommissionRateStr = formData.get('affiliateCommissionRate');
    let affiliateCommissionRate = 0.10; // Default 10%
    if (affiliateCommissionRateStr) {
        affiliateCommissionRate = parseFloat(affiliateCommissionRateStr.toString());
        if (isNaN(affiliateCommissionRate) || affiliateCommissionRate < 0 || affiliateCommissionRate > 1) {
            affiliateCommissionRate = 0.10;
        }
    }

    await prisma.systemConfig.update({
        where: { id: config.id },
        data: {
            welcomeBonusEnabled,
            welcomeBonusAmount,
            affiliateCommissionRate,
        },
    });

    revalidatePath('/admin/marketing');
}
