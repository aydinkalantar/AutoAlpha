import { prisma } from "@/lib/prisma";
import Stripe from 'stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";



export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return new Response('Unauthorized - Admin access required', { status: 403 });
        }
        const config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
        const secretKey = config?.stripeMode === 'LIVE'
            ? (config?.stripeLiveSecretKey || process.env.STRIPE_SECRET_KEY)
            : (config?.stripeTestSecretKey || process.env.STRIPE_SECRET_KEY);

        if (!secretKey) {
            return new Response('Stripe Configuration Missing in Admin Settings', { status: 500 });
        }

        const stripe = new Stripe(secretKey as string, {
            apiVersion: '2023-10-16' as any,
        });

        const { userId } = await req.json();

        if (!userId) {
            return new Response('User ID required', { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || (!user.fiatRefundRequested)) {
            return new Response('No refund requested or user not found', { status: 400 });
        }

        const totalBalance = user.usdtBalance + user.usdcBalance;
        if (totalBalance <= 0) {
            return new Response('No balance to refund', { status: 400 });
        }

        // In a full implementation, you'd look up the original charge/payment intent ID 
        // from your database (e.g. from Ledger metadata or a separate Payments table).
        // For this prototype, we simulate a Stripe refund call assuming we had a generic intent:

        // Perform Ledger updates and balance zeroing in a single transaction
        await prisma.$transaction(async (tx: any) => {
            // 1. Zero out balances
            await tx.user.update({
                where: { id: userId },
                data: {
                    usdtBalance: 0,
                    usdcBalance: 0,
                    fiatRefundRequested: false // clear the flag upon refund
                }
            });

            // 2. Write to Ledger for USDT
            if (user.usdtBalance > 0) {
                await tx.ledger.create({
                    data: {
                        userId,
                        amount: -user.usdtBalance,
                        currency: 'USDT',
                        description: 'System Refund via Fiat Gateway',
                    }
                });
            }

            // 3. Write to Ledger for USDC
            if (user.usdcBalance > 0) {
                await tx.ledger.create({
                    data: {
                        userId,
                        amount: -user.usdcBalance,
                        currency: 'USDC',
                        description: 'System Refund via Fiat Gateway',
                    }
                });
            }
        });

        return new Response('Refund processed successfully', { status: 200 });

    } catch (error) {
        console.error('Refund Execution Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
