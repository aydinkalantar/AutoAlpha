import React from 'react';
import { prisma } from "@/lib/prisma";
import LedgerTable from './LedgerTable';

export const dynamic = 'force-dynamic';



export default async function AdminLedgerPage() {
    const ledgers = await prisma.ledger.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
    });

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-[#1D1D1F] tracking-tight">Master Ledger</h1>
                <p className="text-black/50 mt-2 font-medium">Accounting record of all platform fees, credits, and debits.</p>
            </div>

            <LedgerTable ledgers={ledgers} />
        </div>
    );
}
