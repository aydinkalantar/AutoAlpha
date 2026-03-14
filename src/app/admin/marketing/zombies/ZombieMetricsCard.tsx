"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, AlertTriangle } from "lucide-react";

interface MetricsProps {
    pending: number;
    contacted: number;
}

export default function ZombieMetricsCard({ metrics }: { metrics: MetricsProps }) {
    
    // Calculate total zombies and the percentage we've managed to contact
    const totalZombies = metrics.pending + metrics.contacted;
    const contactedPercentage = totalZombies > 0 ? Math.round((metrics.contacted / totalZombies) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 rounded-t-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Zombies</p>
                            <p className="text-4xl font-black text-foreground">{metrics.pending}</p>
                            <p className="text-xs text-muted-foreground pt-1">Inactive &gt; 24H (No API Key)</p>
                        </div>
                        <div className="p-4 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 rounded-t-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Emails Sent</p>
                            <p className="text-4xl font-black text-foreground">{metrics.contacted}</p>
                            <p className="text-xs text-muted-foreground pt-1">Total lifetime pings</p>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <Mail className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative group">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 rounded-t-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact Rate</p>
                            <p className="text-4xl font-black text-foreground">{contactedPercentage}%</p>
                            <p className="text-xs text-muted-foreground pt-1">Of total pool reached</p>
                        </div>
                        <div className="p-4 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                            <Users className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
