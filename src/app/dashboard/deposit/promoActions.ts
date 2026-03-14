'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function redeemPromoCode(code: string, userId: string) {
  try {
    const uppercaseCode = code.toUpperCase().trim();

    if (!uppercaseCode) {
      return { success: false, message: 'Please enter a valid promo code.' };
    }

    if (!userId) {
      return { success: false, message: 'Authentication required to redeem code.' };
    }

    // Lookup code first
    const promo = await prisma.promoCode.findUnique({
      where: { code: uppercaseCode }
    });

    if (!promo || !promo.isActive) {
      return { success: false, message: 'Invalid or inactive promo code.' };
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return { success: false, message: 'This promo code has expired.' };
    }

    if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
      return { success: false, message: 'This promo code has reached its usage limit.' };
    }

    // Check if user already claimed it
    const existingClaim = await prisma.promoRedemption.findUnique({
      where: {
        userId_promoCodeId: {
          userId: userId,
          promoCodeId: promo.id,
        }
      }
    });

    if (existingClaim) {
      return { success: false, message: 'You have already redeemed this promo code.' };
    }

    // Atomic Transaction for the redemption
    await prisma.$transaction(async (tx) => {
      // 1. Increment usage
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { currentUses: { increment: 1 } }
      });

      // 2. Log redemption to prevent double dipping
      await tx.promoRedemption.create({
        data: {
          userId: userId,
          promoCodeId: promo.id,
        }
      });

      // 3. Credit the user's gas tank
      await tx.user.update({
        where: { id: userId },
        data: { usdtBalance: { increment: promo.creditAmount } }
      });

      // 4. Create Accounting Ledger trace
      await tx.ledger.create({
        data: {
          userId: userId,
          amount: promo.creditAmount,
          currency: 'USDT',
          description: `Promo Code Redeemed: ${uppercaseCode}`,
          type: 'PROMO_CODE'
        }
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/deposit');
    revalidatePath('/admin/marketing/promos');

    return { 
      success: true, 
      message: `Success! $${promo.creditAmount.toFixed(2)} added to your Gas Tank.`,
      amountAdded: promo.creditAmount
    };

  } catch (error) {
    console.error('Redeem Exception:', error);
    return { success: false, message: 'An unexpected error occurred during redemption. Please try again.' };
  }
}
