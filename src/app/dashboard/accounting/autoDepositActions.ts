"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateAutoDepositSettings(
    enabled: boolean,
    threshold: number,
    amount: number
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    // Validate inputs
    if (threshold < 0 || amount <= 0) {
        throw new Error("Invalid auto-deposit parameters");
    }

    // Maximum safety rails
    if (amount > 500) {
        throw new Error("Auto-deposit amount cannot exceed 500");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true }
    });

    if (!user) throw new Error("User not found");

    if (enabled && !user.stripeCustomerId) {
        throw new Error("You must make at least one manual deposit first to save a payment method securely.");
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            autoDepositEnabled: enabled,
            autoDepositThreshold: threshold,
            autoDepositAmount: amount
        }
    });

    revalidatePath('/dashboard/accounting');
    return { success: true };
}
