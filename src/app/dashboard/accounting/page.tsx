import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import AccountingSection from '../AccountingSection';
import AutoDepositSettings from './AutoDepositSettings';

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
        <div className="p-8 pt-[104px] md:p-12 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pr-16 md:pr-0">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Tax & Accounting</h1>
                        <p className="text-foreground/60 mt-2 text-lg">Export your trade history and monitor platform fees.</p>
                    </div>
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
