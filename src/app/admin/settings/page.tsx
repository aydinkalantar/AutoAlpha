import React from 'react';
import { getSystemConfig } from './actions';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    const config = await getSystemConfig();

    return (
        <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12">
            <div className="relative z-10">
                <h1 className="text-4xl font-black text-foreground tracking-tight">Platform Settings</h1>
                <p className="text-foreground/50 mt-2 font-medium">Configure global payment integrations and environment variables.</p>
            </div>

            <SettingsForm config={config} />
        </div>
    );
}
