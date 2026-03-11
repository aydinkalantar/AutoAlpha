import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";
import { NextResponse } from 'next/server';



export async function POST(req: Request) {
    const config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
    const isLive = config?.stripeMode === 'LIVE';

    const secretKey = isLive
        ? (config?.stripeLiveSecretKey || process.env.STRIPE_SECRET_KEY)
        : (config?.stripeTestSecretKey || process.env.STRIPE_SECRET_KEY);

    const endpointSecret = isLive
        ? (config?.stripeLiveWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET)
        : (config?.stripeTestWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET);

    if (!secretKey || !endpointSecret) {
        return new Response('Stripe Configuration Missing in Admin Settings', { status: 500 });
    }

    const stripe = new Stripe(secretKey as string, {
        apiVersion: '2023-10-16' as any,
    });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret as string);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            const { userId, currency, netDesiredAmount } = paymentIntent.metadata;

            if (!userId || !currency || !netDesiredAmount) {
                console.error('Missing metadata in payment intent', paymentIntent.id);
                return new Response('Metadata missing', { status: 400 });
            }

            const amountToCredit = parseFloat(netDesiredAmount);

            // Verify transaction hasn't been processed
            const existingLedger = await prisma.ledger.findFirst({
                where: { userId, amount: amountToCredit, currency, description: `Fiat Gateway Deposit: ${paymentIntent.id}` }
            });

            if (!existingLedger) {
                await prisma.$transaction(async (tx: any) => {
                    // Increment the correct balance based on currency requested (USDT or USDC)
                    if (currency === 'USDT') {
                        await tx.user.update({
                            where: { id: userId },
                            data: { usdtBalance: { increment: amountToCredit } }
                        });
                    } else {
                        await tx.user.update({
                            where: { id: userId },
                            data: { usdcBalance: { increment: amountToCredit } }
                        });
                    }

                    // Write to ledger
                    await tx.ledger.create({
                        data: {
                            userId,
                            amount: amountToCredit,
                            currency: currency,
                            description: `Fiat Gateway Deposit: ${paymentIntent.id}`,
                        }
                    });
                });
            }

        }

    } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }

    return new Response('Success', { status: 200 });
}
