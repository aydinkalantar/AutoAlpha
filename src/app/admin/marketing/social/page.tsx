import React from 'react';
import { SocialProofCard } from './SocialProofCard';

export const dynamic = 'force-dynamic';

export default function SocialMarketingPage() {
    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-4xl mx-auto space-y-12">
            <div className="relative z-10">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Social Marketing</h1>
                <p className="text-foreground/60 mt-2 text-lg">Automate your social proof and manage external communications.</p>
            </div>

            <SocialProofCard />
        </div>
    );
}
