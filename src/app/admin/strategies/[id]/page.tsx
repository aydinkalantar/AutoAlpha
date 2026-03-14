import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StrategyEditClient from "./StrategyEditClient";

export default async function AdminStrategyEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/login");
    }

    const strategy = await prisma.strategy.findUnique({
        where: { id },
    });

    if (!strategy) {
        notFound();
    }

    // Convert Decimals/Dates to native types for client props, preserving exact values
    const serializedStrategy = JSON.parse(JSON.stringify(strategy));

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-12">
            <StrategyEditClient initialStrategy={serializedStrategy} />
        </div>
    );
}
