'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

export async function createPromoCode(formData: FormData) {
  try {
    const code = formData.get('code')?.toString().toUpperCase().trim();
    const creditAmount = parseFloat(formData.get('creditAmount')?.toString() || '0');
    const maxUsesStr = formData.get('maxUses')?.toString();
    const maxUses = maxUsesStr && maxUsesStr !== '' ? parseInt(maxUsesStr, 10) : null;
    
    // Optional date parsing
    const expiresAtStr = formData.get('expiresAt')?.toString();
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    if (!code || isNaN(creditAmount) || creditAmount <= 0) {
      return { success: false, message: 'Invalid code or credit amount.' };
    }

    await prisma.promoCode.create({
      data: {
        code,
        creditAmount,
        maxUses,
        expiresAt,
        isActive: true,
      }
    });

    revalidatePath('/admin/marketing/promos');
    revalidatePath('/dashboard/deposit'); // In case user is on the deposit page
    return { success: true, message: `Promo code ${code} created successfully.` };
  } catch (error: any) {
    console.error('Failed to create promo code:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, message: 'This promo code already exists.' };
    }
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function togglePromoCodeStatus(id: string, currentStatus: boolean) {
  try {
    const updated = await prisma.promoCode.update({
      where: { id },
      data: { isActive: !currentStatus }
    });

    revalidatePath('/admin/marketing/promos');
    return { success: true, message: `Code ${updated.code} is now ${updated.isActive ? 'Active' : 'Inactive'}.` };
  } catch (error) {
    console.error('Failed to toggle promo code:', error);
    return { success: false, message: 'Failed to update promo code status.' };
  }
}
