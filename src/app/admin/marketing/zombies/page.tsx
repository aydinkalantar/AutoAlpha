import { getZombieStats } from "./actions";
import ZombieMetricsCard from "./ZombieMetricsCard";
import ZombieTable from "./ZombieTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Zombie Campaigns | Admin Console",
};

export const dynamic = "force-dynamic";

export default async function ZombieCampaignPage() {
    const { metrics, pendingUsers, contactedUsers } = await getZombieStats();

    return (
        <div className="flex flex-col gap-8 max-w-[1200px] pb-24">
            <header className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">"Zombie User" Sweep</h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">
                            Automated drip campaign targeting users inactive &gt; 24 hours without API keys.
                        </p>
                    </div>
                </div>
            </header>

            <ZombieMetricsCard metrics={metrics} />
            <ZombieTable pendingUsers={pendingUsers} contactedUsers={contactedUsers} />
        </div>
    );
}
