import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
    try {
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

        const { userId, desiredAmount, currency } = await req.json();

        if (!userId || !desiredAmount || !currency) {
            return new Response('Missing required fields', { status: 400 });
        }

        if (currency !== 'USDT' && currency !== 'USDC') {
            return new Response('Unsupported currency', { status: 400 });
        }

        const requestedAmount = parseFloat(desiredAmount);

        // Fee = 2.9% + $0.30
        // Gross = (Desired + 0.30) / (1 - 0.029)
        const grossAmount = (requestedAmount + 0.30) / 0.971;

        // Stripe requires amount in minimum currency unit (cents)
        const amountInCents = Math.round(grossAmount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: {
                userId,
                currency,
                netDesiredAmount: requestedAmount.toString(),
            }
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            grossAmount,
            netDesiredAmount: requestedAmount
        });

    } catch (error) {
        console.error('Payment Intent Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
