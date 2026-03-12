'use server';

import { prisma } from '@/lib/prisma';

export async function getStripePublishableKey(): Promise<string> {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: "global" }
        });

        const isLive = config?.stripeMode === 'LIVE';

        // Check DB for the strict matching key
        const dbKey = isLive ? config?.stripeLivePublicKey : config?.stripeTestPublicKey;
        
        // If DB has a key, use it. Otherwise, fallback to the environment variable for local dev
        if (dbKey) {
            return dbKey;
        }
        
    } catch (error) {
        console.warn("Database offline: Falling back to local env stripe publishable key.");
    }

    // Ultimate fallback if DB empty, offline, or corrupted
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}
