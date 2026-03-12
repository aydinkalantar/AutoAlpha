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

    const user = await prisma.user.findUnique({
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

    if (!user) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
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
