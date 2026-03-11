"use server";

import crypto from 'crypto';
import { MarketType, Currency, SupportedExchange } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';



export async function getStrategies() {
    return await prisma.strategy.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function createStrategy(formData: FormData) {
    const name = formData.get('name') as string;
    const marketType = formData.get('marketType') as MarketType;
    const settlementCurrency = formData.get('currency') as Currency;
    const performanceFeeStr = formData.get('performanceFee') as string;
    const targetExchange = formData.get('targetExchange') as SupportedExchange;

    const pair = formData.get('pair') as string;
    const leverage = parseFloat(formData.get('leverage') as string) || 1.0;
    const maxLeverage = parseFloat(formData.get('maxLeverage') as string) || 1.0;
    const defaultEquityPercentage = parseFloat(formData.get('defaultEquity') as string) || 95.0;

    const expectedRoiPercentage = parseFloat(formData.get('expectedRoi') as string) || null;
    const winRatePercentage = parseFloat(formData.get('winRate') as string) || null;
    const drawdownPercentage = parseFloat(formData.get('drawdown') as string) || null;
    const isPublic = formData.get('isPublic') === 'on';

    const performanceFeePercentage = parseFloat(performanceFeeStr) || 30.0;
    const webhookToken = crypto.randomBytes(32).toString('hex');

    if (!name || !marketType || !settlementCurrency || !targetExchange || !pair) {
        throw new Error('Missing required fields');
    }

    await prisma.strategy.create({
        data: {
            name,
            targetExchange,
            marketType,
            settlementCurrency,
            performanceFeePercentage,
            webhookToken,
            pair,
            leverage,
            maxLeverage,
            defaultEquityPercentage,
            expectedRoiPercentage,
            winRatePercentage,
            drawdownPercentage,
            isActive: true,
            isPublic,
        }
    });

    revalidatePath('/admin/strategies');
}

export async function toggleStrategyActive(id: string) {
    const strategy = await prisma.strategy.findUnique({ where: { id } });
    if (!strategy) return;

    await prisma.strategy.update({
        where: { id },
        data: { isActive: !strategy.isActive }
    });

    revalidatePath('/admin/strategies');
}

export async function toggleStrategyPublic(id: string) {
    const strategy = await prisma.strategy.findUnique({ where: { id } });
    if (!strategy) return;

    await prisma.strategy.update({
        where: { id },
        data: { isPublic: !strategy.isPublic }
    });

    revalidatePath('/admin/strategies');
    revalidatePath('/'); // Revalidate the public landing page showcase
}

export async function updateStrategySafeSettings(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const performanceFeePercentage = parseFloat(formData.get('performanceFee') as string) || 30.0;
    const defaultEquityPercentage = parseFloat(formData.get('defaultEquity') as string) || 95.0;
    const expectedRoiPercentage = parseFloat(formData.get('expectedRoi') as string) || null;
    const winRatePercentage = parseFloat(formData.get('winRate') as string) || null;
    const drawdownPercentage = parseFloat(formData.get('drawdown') as string) || null;

    if (!name) throw new Error('Name is required');

    await prisma.strategy.update({
        where: { id },
        data: {
            name,
            performanceFeePercentage,
            defaultEquityPercentage,
            expectedRoiPercentage,
            winRatePercentage,
            drawdownPercentage,
        }
    });

    revalidatePath('/admin/strategies');
    revalidatePath('/'); // Force landing page refresh
}

export async function generateWebhook(id: string) {
    const newWebhookToken = crypto.randomBytes(32).toString('hex');

    await prisma.strategy.update({
        where: { id },
        data: { webhookToken: newWebhookToken }
    });
    revalidatePath('/admin/strategies');
}

export async function deleteStrategy(id: string) {
    await prisma.strategy.delete({
        where: { id }
    });
    revalidatePath('/admin/strategies');
}
