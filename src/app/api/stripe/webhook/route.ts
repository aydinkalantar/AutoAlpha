import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    let config = null;
    try {
        config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
    } catch (e) {
        console.warn("Database offline: Webhook falling back to local .env keys");
    }

    const isLive = config?.stripeMode === 'LIVE';

    const secretKey = isLive
        ? (config?.stripeLiveSecretKey || process.env.STRIPE_SECRET_KEY)
        : (config?.stripeTestSecretKey || process.env.STRIPE_SECRET_KEY);

    const endpointSecret = isLive
        ? (config?.stripeLiveWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET)
        : (config?.stripeTestWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET);

    if (!secretKey || !endpointSecret) {
        return NextResponse.json({ message: "Missing required Stripe Secrets or Webhook Signatures in Admin Config" }, { status: 400 });
    }

    const stripe = new Stripe(secretKey as string, {
        apiVersion: '2023-10-16' as any,
    });

    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
        return NextResponse.json({ message: "Missing Stripe Signature Header" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret as string);
    } catch (err: any) {
        console.error("Webhook signature mismatch:", err.message);
        return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle Payment Intent completion from the React Elements
    if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;

        const userId = intent.metadata?.userId;
        const currencyChoice = intent.metadata?.currency; // 'USDT' | 'USDC'
        const baseAmountStr = intent.metadata?.netDesiredAmount;

        if (!userId || !currencyChoice || !baseAmountStr) {
            console.error("Missing critical metadata in stripe payment intent.");
            return NextResponse.json({ message: "Missing metadata" }, { status: 400 });
        }

        const exactDepositAmount = parseFloat(baseAmountStr);

        try {
            // Check for previous process to prevent double crediting
            let existingLedger = null;
            try {
                existingLedger = await prisma.ledger.findFirst({
                    where: { description: { contains: intent.id } }
                });
            } catch (e) {
                console.warn("Database offline: Skipping ledger double-credit check.");
            }

            if (!existingLedger) {
                try {
                    await prisma.$transaction(async (tx) => {
                        const updateData = currencyChoice === 'USDT'
                            ? { usdtBalance: { increment: exactDepositAmount } }
                            : { usdcBalance: { increment: exactDepositAmount } };

                        await tx.user.update({
                            where: { id: userId },
                            data: updateData,
                        });

                        await tx.ledger.create({
                            data: {
                                userId,
                                type: 'DEPOSIT',
                                amount: exactDepositAmount,
                                currency: currencyChoice as 'USDT' | 'USDC',
                                description: `Stripe Card Deposit (Intent: ${intent.id})`
                            }
                        });
                    });
                } catch (txError) {
                     console.warn("Database offline: Could not logically credit user balance.");
                }
            }
        } catch (error) {
            console.error("Failed to credit stripe deposit to db.", error);
            // DO NOT RETURN 500 HERE on offline, otherwise Stripe will retry indefinitely. 
            // Just let it drop safely below.
        }
    }

    // Return 200 to acknowledge receipt to Stripe
    return NextResponse.json({ received: true }, { status: 200 });
}
