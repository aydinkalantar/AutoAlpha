import React from 'react';
import { getStrategies } from './actions';
import CreateStrategyForm from './CreateStrategyForm';
import StrategyTable from './StrategyTable';

export const dynamic = 'force-dynamic';

export default async function AdminStrategiesPage() {
    const strategies = await getStrategies();

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
            <div className="relative z-10">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Strategy Management</h1>
                <p className="text-foreground/60 mt-2 text-lg">Create new trading strategies and manage webhook connections.</p>
            </div>

            <CreateStrategyForm />

            <div className="relative z-10">
                <h2 className="text-2xl font-black text-foreground mb-6 tracking-tight">Active Strategies</h2>
                <StrategyTable strategies={strategies} />
            </div>
        </div>
    );
}
