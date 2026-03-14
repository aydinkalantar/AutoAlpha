import React from 'react';
import { getZombieCampaignConfig, getZombieEmailsSentCount } from './actions';
import ZombieCampaignForm from './ZombieCampaignForm';

export const dynamic = 'force-dynamic';

export default async function AdminAutomationsPage() {
    const config = await getZombieCampaignConfig();
    const emailsSentCount = await getZombieEmailsSentCount();

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-4xl mx-auto space-y-12">
            <div className="relative z-10">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Automations</h1>
                <p className="text-foreground/60 mt-2 text-lg">Manage automated marketing campaigns and drip sequences.</p>
            </div>

            <ZombieCampaignForm config={config} emailsSentCount={emailsSentCount} />
        </div>
    );
}
