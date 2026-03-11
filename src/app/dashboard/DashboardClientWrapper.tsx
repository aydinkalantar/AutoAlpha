"use client";

import { useState } from "react";
import StrategyMarketplace from "./StrategyMarketplace";
import { Strategy } from "@prisma/client";

interface wrapperProps {
    strategies: Strategy[];
    subscriptions: any[];
    userId: string;
    usdtBalance: number;
    usdcBalance: number;
    isPaperMode: boolean;
    connectedExchanges: string[];
}

export default function DashboardClientWrapper({ strategies, subscriptions, userId, usdtBalance, usdcBalance, isPaperMode, connectedExchanges }: wrapperProps) {
    return (
        <div>
            <StrategyMarketplace strategies={strategies} subscriptions={subscriptions} userId={userId} usdtBalance={usdtBalance} usdcBalance={usdcBalance} isPaperMode={isPaperMode} connectedExchanges={connectedExchanges} />
        </div>
    );
}
