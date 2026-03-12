import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
    try {
        let config = null;
        try {
            config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
        } catch (dbError) {
            console.warn("Database offline: Falling back to local env stripe secret key.");
        }

        const secretKey = config?.stripeMode === 'LIVE'
            ? (config?.stripeLiveSecretKey || process.env.STRIPE_SECRET_KEY)
            : (config?.stripeTestSecretKey || process.env.STRIPE_SECRET_KEY);

        if (!secretKey) {
            return new Response('Stripe Configuration Missing in Admin Settings and Env', { status: 500 });
        }

        const stripe = new Stripe(secretKey as string, {
            apiVersion: '2023-10-16' as any,
        });

        const { userId, desiredAmount, currency, saveCard } = await req.json();

        if (!userId || !desiredAmount || !currency) {
            return new Response('Missing required fields', { status: 400 });
        }

        if (currency !== 'USDT' && currency !== 'USDC') {
            return new Response('Unsupported currency', { status: 400 });
        }

        let user = null;
        try {
            user = await prisma.user.findUnique({ where: { id: userId } });
        } catch (dbError) {
            console.warn("Database offline: Proceeding with mock user for stripe intent.");
            user = { id: userId, email: "localdev@autoalpha.trade", stripeCustomerId: null };
        }

        if (!user) {
            return new Response('User not found', { status: 404 });
        }

        let customerId = user.stripeCustomerId;

        // Create a Stripe Customer if they don't have one and we want to enable Auto-Deposit
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || undefined,
            });
            customerId = customer.id;
            
            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: { stripeCustomerId: customerId }
                });
            } catch (dbError) {
                console.warn("Database offline: Could not save stripe customer ID, but proceeding with payment intent.");
            }
        }

        const requestedAmount = parseFloat(desiredAmount);

        // Fee = 2.9% + $0.30
        // Gross = (Desired + 0.30) / (1 - 0.029)
        const grossAmount = (requestedAmount + 0.30) / 0.971;

        // Stripe requires amount in minimum currency unit (cents)
        const amountInCents = Math.round(grossAmount * 100);

        const intentPayload: any = {
            amount: amountInCents,
            currency: 'usd',
            customer: customerId,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId,
                currency,
                netDesiredAmount: requestedAmount.toString(),
            }
        };

        if (saveCard) {
            intentPayload.setup_future_usage = 'off_session'; // Save the card for Auto-Refill (disables crypto)
        }

        const paymentIntent = await stripe.paymentIntents.create(intentPayload);

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            grossAmount,
            netDesiredAmount: requestedAmount
        });

    } catch (error: any) {
        console.error('Payment Intent Error:', error);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
