import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";



export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const subscriptionId = id;
        const userId = (session.user as any).id;

        const sub = await prisma.subscription.findFirst({
            where: { id: subscriptionId, userId: userId }
        });

        if (!sub) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { isActive: !sub.isActive }
        });

        return NextResponse.json({ success: true, isActive: !sub.isActive });
    } catch (error) {
        console.error("Toggle strategy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
