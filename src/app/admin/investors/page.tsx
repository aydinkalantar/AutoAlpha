import React from 'react';
import { getUsers } from './actions';
import InvestorTable from './InvestorTable';

export const dynamic = 'force-dynamic';

export default async function AdminInvestorsPage() {
    const users = await getUsers();

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
            <div>
                <h1 className="text-4xl font-bold text-[#1D1D1F] tracking-tight">Investor CRM</h1>
                <p className="text-black/50 mt-2 font-medium">Manage user balances, track API connections, and process manual ledger adjustments.</p>
            </div>

            <div>
                <InvestorTable users={users} />
            </div>
        </div>
    );
}
