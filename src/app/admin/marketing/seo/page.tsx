import React from 'react';
import { getAllSEOSettings } from '@/app/actions/seo';
import SEOTable from './SEOTable';

export const dynamic = 'force-dynamic';

export default async function AdminSEOPage() {
    const settings = await getAllSEOSettings();

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-5xl mx-auto space-y-8">
            <div className="relative z-10">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">SEO Management</h1>
                <p className="text-foreground/60 mt-2 text-lg">Control dynamic metadata and open graph images for platform routes.</p>
            </div>

            <SEOTable initialSettings={settings} />
        </div>
    );
}
