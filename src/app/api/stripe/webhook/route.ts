import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig || !endpointSecret) {
        return NextResponse.json({ message: "Missing required Stripe Secrets or Signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error("Webhook signature mismatch:", err.message);
        return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const currencyChoice = session.metadata?.currency; // 'USDT' | 'USDC'
        // Stripe stores amount in cents. The base amount is what we credit. 
        // Note: The total charge includes fee, so calculate base amount if you encoded it in metadata
        const baseAmountStr = session.metadata?.baseAmount;

        if (!userId || !currencyChoice || !baseAmountStr) {
            console.error("Missing critical metadata in stripe session.");
            return NextResponse.json({ message: "Missing metadata" }, { status: 400 });
        }

        const exactDepositAmount = parseFloat(baseAmountStr);

        try {
            // Check for previous process to prevent double crediting
            const existingLedger = await prisma.ledger.findFirst({
                where: { description: { contains: session.id } }
            });

            if (!existingLedger) {
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
                            amount: exactDepositAmount, // Assuming totalNum was a typo and exactDepositAmount is intended
                            currency: currencyChoice as 'USDT' | 'USDC',
                            description: `Stripe Card Deposit (Session: ${session.id}) - ${JSON.stringify({ sessionId: session.id, customerEmail: session.customer_details?.email, stripeSessionId: session.id, method: 'card', verifiedAt: new Date().toISOString() })}`
                        }
                    });
                });
            }
        } catch (error) {
            console.error("Failed to credit stripe deposit to db.", error);
            return NextResponse.json({ message: "Database Error" }, { status: 500 });
        }
    }

    // Return 200 to acknowledge receipt to Stripe
    return NextResponse.json({ received: true }, { status: 200 });
}
