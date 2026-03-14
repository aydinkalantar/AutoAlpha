import React from 'react';
import { prisma } from '@/lib/prisma';
import BroadcastForm from './BroadcastForm';
import BroadcastHistoryTable from './BroadcastHistoryTable';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminBroadcastsPage() {
    const logs = await prisma.broadcastLog.findMany({
        orderBy: {
            sentAt: 'desc',
        },
        take: 100
    });

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-4xl mx-auto space-y-12">
            <div className="relative z-10">
                <Link href="/admin/marketing" className="inline-flex items-center text-sm font-medium text-foreground/50 hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Marketing
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Email Broadcasts</h1>
                        <p className="text-foreground/60 mt-1 text-lg">Send targeted email campaigns to your users.</p>
                    </div>
                </div>
            </div>

            <BroadcastForm />
            
            <BroadcastHistoryTable logs={logs} />
        </div>
    );
}
