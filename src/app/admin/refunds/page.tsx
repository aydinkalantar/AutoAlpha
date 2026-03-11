import React from 'react';

export const dynamic = 'force-dynamic';

export default async function AdminRefundsPage() {

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
            <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Fiat Refund Manager</h1>
                <p className="text-foreground/60 mt-2 text-lg">Manage user refunds.</p>
            </div>
        </div>
    );
}
