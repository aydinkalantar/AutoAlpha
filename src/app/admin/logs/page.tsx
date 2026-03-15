import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import AdminLogsClient from './AdminLogsClient';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
    // 1. Double check security
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    // 2. Fetch Audit Logs natively (from most recent to oldest)
    const auditLogs = await prisma.auditLog.findMany({
        orderBy: {
            timestamp: 'desc'
        },
        take: 100 // Cap to prevent massive payload overloads
    });

    // 3. Fetch Broadcast Logs (from most recent to oldest)
    const broadcastLogs = await prisma.broadcastLog.findMany({
        orderBy: {
            sentAt: 'desc'
        },
        take: 100
    });

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
            <AdminLogsClient auditLogs={auditLogs} broadcastLogs={broadcastLogs} />
        </div>
    );
}
