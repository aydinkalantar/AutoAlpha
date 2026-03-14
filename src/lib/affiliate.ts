import { prisma } from "@/lib/prisma";

/**
 * Processes affiliate commissions when a user pays a performance fee
 * @param payingUserId The ID of the user who just paid a fee
 * @param feeAmount The amount of the fee they paid
 */
export async function processAffiliateCommission(payingUserId: string, feeAmount: number) {
    if (feeAmount <= 0) return;

    try {
        const payingUser = await prisma.user.findUnique({
            where: { id: payingUserId },
            include: { referredBy: true }
        });

        const referrer = payingUser?.referredBy;

        // If the user has no referrer, no commission is paid
        if (!referrer) {
            return;
        }

        const config = await prisma.systemConfig.findUnique({
            where: { id: "global" }
        });

        const commissionRate = config?.affiliateCommissionRate || 0.10;
        const commissionAmount = feeAmount * commissionRate;

        if (commissionAmount <= 0) return;

        // Perform atomic update on the referrer
        await prisma.$transaction(async (tx: any) => {
            await tx.user.update({
                where: { id: referrer.id },
                data: {
                    affiliateBalance: { increment: commissionAmount },
                    totalAffiliateEarnings: { increment: commissionAmount },
                    usdtBalance: { increment: commissionAmount } // Directly credit their gas tank
                }
            });

            await tx.ledger.create({
                data: {
                    userId: referrer.id,
                    amount: commissionAmount,
                    currency: "USDT",
                    type: "AFFILIATE_COMMISSION",
                    description: `Commission from fee paid by ${payingUser.email}`,
                }
            });
        });

        console.log(`[AFFILIATE] Credited $${commissionAmount.toFixed(2)} to ${referrer.email} for referral ${payingUser.email}`);
    } catch (error) {
        console.error(`[AFFILIATE ERROR] Failed to process commission for user ${payingUserId}:`, error);
        // We purposely do not throw here.
        // A failure in commission tracking should not crash the core billing loop.
    }
}
