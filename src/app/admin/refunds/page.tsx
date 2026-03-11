import React from 'react';

export const dynamic = 'force-dynamic';

export default async function AdminRefundsPage() {

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
            <div>
                <h1 className="text-4xl font-bold text-[#1D1D1F] tracking-tight">Fiat Refund Manager</h1>
                <p className="text-black/50 mt-2 font-medium">Manage user refunds.</p>
            </div>
        </div>
    );
}
