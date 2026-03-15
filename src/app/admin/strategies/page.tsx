import React from 'react';
import { getStrategies } from './actions';
import CreateStrategyForm from './CreateStrategyForm';
import StrategyTable from './StrategyTable';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminStrategiesPage() {
    const strategies = await getStrategies();

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Strategy Management</h1>
                    <p className="text-foreground/60 mt-2 text-lg">Create new trading strategies and manage webhook connections.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="font-bold text-sm bg-foreground text-background hover:bg-foreground/80 rounded-full px-6 py-5">+ New Strategy</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl bg-white/70 dark:bg-white/10 backdrop-blur-3xl border-black/5 dark:border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
                        <DialogTitle className="sr-only">Create New Strategy</DialogTitle>
                        <DialogDescription className="sr-only">Form to create a new trading strategy.</DialogDescription>
                        <CreateStrategyForm />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Active Strategies</h2>
                </div>
                <StrategyTable strategies={strategies} />
            </div>
        </div>
    );
}
