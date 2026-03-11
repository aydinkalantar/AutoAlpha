"use server";

import { prisma } from "@/lib/prisma";



export async function getRefundRequests() {
    return await prisma.user.findMany({
        where: {
            fiatRefundRequested: true,
            OR: [
                { usdtBalance: { gt: 0 } },
                { usdcBalance: { gt: 0 } }
            ]
        }
    });
}
