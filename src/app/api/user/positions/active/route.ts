import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { searchParams } = new URL(req.url);
        const isPaperRaw = searchParams.get('isPaper');
        const isPaperMode = isPaperRaw === 'true';

        // Fetch only open positions matching the requested mode
        const openPositions = await prisma.position.findMany({
            where: {
                userId,
                isOpen: true,
                isPaper: isPaperMode
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, positions: openPositions });

    } catch (error: any) {
        console.error("LiveRadar Polling Error:", error);
        return NextResponse.json({ error: "Failed to fetch active positions", details: error.message }, { status: 500 });
    }
}
