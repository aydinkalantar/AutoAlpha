import React from 'react';
import { getMarketingConfig } from './actions';
import MarketingForm from './MarketingForm';

export const dynamic = 'force-dynamic';

export default async function AdminMarketingPage() {
    const config = await getMarketingConfig();

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-4xl mx-auto space-y-12">
            <div className="relative z-10">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Marketing</h1>
                <p className="text-foreground/60 mt-2 text-lg">Manage promotional campaigns, welcome bonuses, and email outreach.</p>
            </div>

            <MarketingForm config={config} />
        </div>
    );
}
