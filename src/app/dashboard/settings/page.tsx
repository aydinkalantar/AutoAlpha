import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import ApiKeyForm from '../ApiKeyForm';

export const dynamic = 'force-dynamic';



export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;

    let user: any = null;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                exchangeKeys: true
            }
        });
    } catch (e) {
        console.warn("Could not fetch user exchange keys from database. Returning empty keys.");
        user = {
            id: userId,
            exchangeKeys: []
        };
    }

    if (!user) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="p-8 pt-20 md:p-12 md:pt-20 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Exchange Security</h1>
                        <p className="text-foreground/60 mt-2 text-lg">Manage your API connections and trading permissions.</p>
                    </div>
                </div>
            </div>

            <ApiKeyForm userId={user.id} existingKeys={user.exchangeKeys as any} />
        </div>
    );
}
