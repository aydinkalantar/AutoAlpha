import React from 'react';
import { prisma } from "@/lib/prisma";
import LedgerTable from './LedgerTable';

export const dynamic = 'force-dynamic';



export default async function AdminLedgerPage() {
    let ledgers: any[] = [];
    try {
        ledgers = await prisma.ledger.findMany({
            where: { isPaper: false },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true } } }
        });
    } catch (e) {
        console.warn("Could not fetch ledgers from database. Returning empty array.");
    }

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Master Ledger</h1>
                <p className="text-foreground/60 mt-2 text-lg">Accounting record of all platform fees, credits, and debits.</p>
            </div>

            <LedgerTable ledgers={ledgers} />
        </div>
    );
}
