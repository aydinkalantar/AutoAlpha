import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StrategyProfileClient from "./StrategyProfileClient";

export default async function StrategyProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;

    let user: any = null;
    let strategy: any = null;

    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    where: { strategyId: id }
                },
                exchangeKeys: true
            }
        });

        strategy = await prisma.strategy.findUnique({
            where: { id },
        });
    } catch (e) {
        console.warn("Could not fetch strategy or user from database. Redirecting to market.");
        redirect("/dashboard/market");
    }

    if (!strategy) {
        notFound();
    }

    const isPaperMode = user.isTestnetMode;
    const usdtBalance = isPaperMode ? user.paperUsdtBalance : user.usdtBalance;
    const usdcBalance = isPaperMode ? user.paperUsdcBalance : user.usdcBalance;
    const modeSubscriptions = user.subscriptions.filter((s: any) => s.isPaper === isPaperMode);

    const connectedExchanges = user.exchangeKeys
        .filter((key: any) => key.isTestnet === isPaperMode && key.isValid)
        .map((key: any) => key.exchange);

    const serializedStrategy = JSON.parse(JSON.stringify(strategy));

    return (
        <div className="p-8 pt-20 md:p-12 md:pt-20 max-w-7xl mx-auto space-y-12">
            <StrategyProfileClient 
                strategy={serializedStrategy} 
                subscriptions={modeSubscriptions}
                userId={user.id}
                usdtBalance={usdtBalance}
                usdcBalance={usdcBalance}
                isPaperMode={isPaperMode}
                connectedExchanges={connectedExchanges}
            />
        </div>
    );
}
