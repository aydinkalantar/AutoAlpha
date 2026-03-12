"use server";

import crypto from 'crypto';
import { MarketType, Currency, SupportedExchange } from '@prisma/client';
import { prisma } from '@/lib/prisma';
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

export async function getStrategies() {
    await verifyAdmin();
    return await prisma.strategy.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function createStrategy(formData: FormData) {
    await verifyAdmin();
    const name = formData.get('name') as string;
    const marketType = formData.get('marketType') as MarketType;
    const settlementCurrency = formData.get('currency') as Currency;
    const performanceFeeStr = formData.get('performanceFee') as string;
    const targetExchange = formData.get('targetExchange') as SupportedExchange;
    const description = formData.get('description') as string | null;

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
            description,
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
    await verifyAdmin();
    const strategy = await prisma.strategy.findUnique({ where: { id } });
    if (!strategy) return;

    await prisma.strategy.update({
        where: { id },
        data: { isActive: !strategy.isActive }
    });

    revalidatePath('/admin/strategies');
}

export async function toggleStrategyPublic(id: string) {
    await verifyAdmin();
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
    await verifyAdmin();
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
    await verifyAdmin();
    const newWebhookToken = crypto.randomBytes(32).toString('hex');

    await prisma.strategy.update({
        where: { id },
        data: { webhookToken: newWebhookToken }
    });
    revalidatePath('/admin/strategies');
}

export async function deleteStrategy(id: string) {
    await verifyAdmin();
    await prisma.strategy.delete({
        where: { id }
    });
    revalidatePath('/admin/strategies');
}

export async function updateStrategyDetails(id: string, data: {
    description?: string;
    riskParameters?: any[];
    winRatePercentage?: number | null;
    drawdownPercentage?: number | null;
    profitFactor?: number | null;
}) {
    await verifyAdmin();

    try {
        await prisma.strategy.update({
            where: { id },
            data: {
                description: data.description,
                riskParameters: data.riskParameters ?? undefined,
                winRatePercentage: data.winRatePercentage ?? undefined,
                drawdownPercentage: data.drawdownPercentage ?? undefined,
                profitFactor: data.profitFactor ?? undefined
            }
        });
        return { success: true };
    } catch (e: any) {
        console.error("Failed to update strategy details", e);
        return { success: false, error: e.message };
    }
}

export async function uploadStrategyBacktestData(id: string, backtestData: any[]) {
    await verifyAdmin();

    try {
        let expectedRoiPercentage: number | null = null;
        let drawdownPercentage: number | null = null;

        if (backtestData && backtestData.length > 0) {
            const initialEquity = Number(backtestData[0].equity);
            const finalEquity = Number(backtestData[backtestData.length - 1].equity);

            if (initialEquity > 0) {
                expectedRoiPercentage = ((finalEquity - initialEquity) / initialEquity) * 100;
            }

            let peak = initialEquity;
            let maxDrawdown = 0;

            for (const row of backtestData) {
                const equity = Number(row.equity);
                if (equity > peak) {
                    peak = equity;
                }
                if (peak > 0) {
                    const drawdown = ((peak - equity) / peak) * 100;
                    if (drawdown > maxDrawdown) {
                        maxDrawdown = drawdown;
                    }
                }
            }
            drawdownPercentage = maxDrawdown;
        }

        await prisma.strategy.update({
            where: { id },
            data: { 
                backtestData: backtestData as any,
                ...(expectedRoiPercentage !== null && { expectedRoiPercentage }),
                ...(drawdownPercentage !== null && { drawdownPercentage })
            }
        });
        return { success: true };
    } catch (e: any) {
        console.error("Failed to upload backtest data", e);
        return { success: false, error: e.message };
    }
}
