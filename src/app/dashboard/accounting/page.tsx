import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import AccountingSection from '../AccountingSection';
import AutoDepositSettings from './AutoDepositSettings';
import NotificationBell from '@/components/dashboard/NotificationBell';

export const dynamic = 'force-dynamic';



export default async function AccountingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;

    let user: any = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                positions: {
                    orderBy: { createdAt: 'desc' }
                },
                ledgers: {
                    orderBy: { createdAt: 'desc' },
                    take: 1000
                }
            }
        });
    } catch (e) {
        console.warn("Could not fetch user ledgers from database. Returning empty records.");
        user = {
            id: userId,
            usdtBalance: 0,
            usdcBalance: 0,
            autoDepositEnabled: false,
            autoDepositThreshold: 0,
            autoDepositAmount: 0,
            stripeCustomerId: null,
            positions: [],
            ledgers: []
        };
    }

    if (!user) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="p-8 pt-8 md:p-12 md:pt-12 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-row items-start justify-between gap-4 w-full">
                <div className="flex flex-col gap-2 w-full break-words">
                    <h1 className="text-4xl font-bold text-foreground tracking-tight break-words w-full">Tax & Accounting</h1>
                    <p className="text-foreground/60 text-lg">Export your trade history and monitor platform fees.</p>
                </div>
                <div className="flex-shrink-0">
                    <NotificationBell userId={user.id} />
                </div>
            </div>

            <AccountingSection
                ledgers={user.ledgers}
                positions={user.positions}
                usdtBalance={user.usdtBalance}
                usdcBalance={user.usdcBalance}
            />

            <AutoDepositSettings 
                autoDepositEnabled={user.autoDepositEnabled}
                autoDepositThreshold={user.autoDepositThreshold}
                autoDepositAmount={user.autoDepositAmount}
                hasStripeCustomer={!!user.stripeCustomerId}
            />
        </div>
    );
}
