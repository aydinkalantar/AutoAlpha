import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StrategyEditClient from "./StrategyEditClient";

export default async function AdminStrategyEditPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/login");
    }

    const strategy = await prisma.strategy.findUnique({
        where: { id: params.id },
    });

    if (!strategy) {
        notFound();
    }

    // Convert Decimals/Dates to native types for client props, preserving exact values
    const serializedStrategy = JSON.parse(JSON.stringify(strategy));

    return (
        <div className="p-8 pt-20 md:p-12 md:pt-20 max-w-7xl mx-auto space-y-12">
            <StrategyEditClient initialStrategy={serializedStrategy} />
        </div>
    );
}
