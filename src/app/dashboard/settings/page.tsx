import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Key, Receipt, Users, Bell } from 'lucide-react';

import AccountTab from './AccountTab';
import ApiKeysTab from './ApiKeysTab';
import AccountingTab from './AccountingTab';
import AffiliatesTab from './AffiliatesTab';
import NotificationsTab from './NotificationsTab';

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
                exchangeKeys: true,
                positions: { orderBy: { createdAt: 'desc' }, take: 50 },
                ledgers: { orderBy: { createdAt: 'desc' }, take: 100 },
                referrals: true
            }
        });
    } catch (e) {
        console.warn("Could not fetch complete user data. Returning default skeleton.");
        user = {
            id: userId,
            email: session.user.email,
            name: session.user.name,
            createdAt: new Date(),
            exchangeKeys: [],
            positions: [],
            ledgers: [],
            referrals: [],
            usdtBalance: 0,
            usdcBalance: 0,
            autoDepositEnabled: false,
            autoDepositThreshold: 0,
            autoDepositAmount: 0,
            stripeCustomerId: null,
            tradeEmailNotifications: true,
            isTestnetMode: false,
            referralCode: "UNAVAILABLE"
        };
    }

    if (!user) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-8 md:space-y-12">
            
            {/* Header */}
            <div className="flex flex-row items-start justify-between gap-4 w-full">
                <div className="flex flex-col gap-2 w-full break-words">
                    <h1 className="text-4xl font-bold text-foreground tracking-tight break-words w-full">Settings & Preferences</h1>
                    <p className="text-foreground/60 text-lg">Manage your account, API connections, and billing.</p>
                </div>
            </div>

            {/* Tabbed Layout Container */}
            <div className="w-full">
                <Tabs defaultValue="account" orientation="vertical" className="flex flex-col md:flex-row gap-6 md:gap-10">
                    
                    {/* Tab List / Nav (Horizontal on Mobile, Vertical on Desktop) */}
                    <TabsList className="flex flex-row md:flex-col h-auto max-w-full overflow-x-auto no-scrollbar md:w-64 shrink-0 bg-transparent gap-2 p-0 justify-start items-start border-b md:border-b-0 border-black/10 dark:border-white/10 md:pr-4 md:border-r pb-2 md:pb-0">
                        <TabsTrigger value="account" className="w-auto md:w-full flex-none h-auto justify-start text-left px-4 py-3 text-base rounded-xl data-[state=active]:bg-white/50 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
                            <User className="w-5 h-5 mr-3" /> Account Hub
                        </TabsTrigger>
                        <TabsTrigger value="api-keys" className="w-auto md:w-full flex-none h-auto justify-start text-left px-4 py-3 text-base rounded-xl data-[state=active]:bg-white/50 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
                            <Key className="w-5 h-5 mr-3" /> Exchange APIs
                        </TabsTrigger>
                        <TabsTrigger value="accounting" className="w-auto md:w-full flex-none h-auto justify-start text-left px-4 py-3 text-base rounded-xl data-[state=active]:bg-white/50 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
                            <Receipt className="w-5 h-5 mr-3" /> Accounting
                        </TabsTrigger>
                        <TabsTrigger value="affiliates" className="w-auto md:w-full flex-none h-auto justify-start text-left px-4 py-3 text-base rounded-xl data-[state=active]:bg-white/50 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
                            <Users className="w-5 h-5 mr-3" /> Affiliates
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="w-auto md:w-full flex-none h-auto justify-start text-left px-4 py-3 text-base rounded-xl data-[state=active]:bg-white/50 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
                            <Bell className="w-5 h-5 mr-3" /> Notifications
                        </TabsTrigger>
                    </TabsList>

                    {/* Content Areas */}
                    <div className="flex-1 min-w-0">
                        <TabsContent value="account">
                            <AccountTab user={user} />
                        </TabsContent>
                        
                        <TabsContent value="api-keys">
                            <ApiKeysTab user={user} />
                        </TabsContent>
                        
                        <TabsContent value="accounting">
                            <AccountingTab user={user} />
                        </TabsContent>
                        
                        <TabsContent value="affiliates">
                            <AffiliatesTab user={user} />
                        </TabsContent>
                        
                        <TabsContent value="notifications">
                            <NotificationsTab user={user} />
                        </TabsContent>
                    </div>

                </Tabs>
            </div>

        </div>
    );
}
