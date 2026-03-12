"use server";

import { prisma } from "@/lib/prisma";



export async function getRefundRequests() {
    try {
        return await prisma.user.findMany({
            where: {
                fiatRefundRequested: true,
                OR: [
                    { usdtBalance: { gt: 0 } },
                    { usdcBalance: { gt: 0 } }
                ]
            }
        });
    } catch (e) {
        console.warn("Could not fetch refund requests. Returning empty array.");
        return [];
    }
}
