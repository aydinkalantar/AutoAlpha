"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { triggerManualZombieSweep } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, RefreshCw, AlertCircle } from "lucide-react";

interface UserNode {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    zombieEmailSentAt?: Date | null;
}

interface ZombieTableProps {
    pendingUsers: UserNode[];
    contactedUsers: UserNode[];
}

export default function ZombieTable({ pendingUsers, contactedUsers }: ZombieTableProps) {
    const [isTriggering, setIsTriggering] = useState(false);

    async function handleManualSweep() {
        if (!confirm("Are you sure you want to manually trigger the Zombie Drip Campaign? This will immediately email all pending users.")) return;

        setIsTriggering(true);
        toast.loading("Initiating manual Resend blast...", { id: "sweep" });

        try {
            const result = await triggerManualZombieSweep();
            if (result.success) {
                toast.success(result.message, { id: "sweep" });
                // Force a hard refresh to visually move users into the 'Contacted' tab
                window.location.reload();
            } else {
                toast.error(result.message, { id: "sweep" });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to trigger sweep. Check server logs.", { id: "sweep" });
        } finally {
            setIsTriggering(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight">Campaign Roster</h2>
                    <p className="text-sm text-muted-foreground">Manage users identified as inactive &gt; 24H without Exchange Keys.</p>
                </div>
                
                <Button 
                    onClick={handleManualSweep} 
                    disabled={isTriggering || pendingUsers.length === 0}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 relative overflow-hidden group"
                >
                    {isTriggering ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    )}
                    {isTriggering ? "Broadcasting..." : "Trigger Manual Sweep"}
                </Button>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                    <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-semibold">
                        Pending Queue ({pendingUsers.length})
                    </TabsTrigger>
                    <TabsTrigger value="contacted" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-semibold">
                        Contacted History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4 outline-none">
                    <div className="rounded-xl border border-black/5 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-xl">
                        {pendingUsers.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                                <div className="p-4 bg-emerald-500/10 rounded-full">
                                    <AlertCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="font-bold text-lg">Queue Empty</h3>
                                <p className="text-muted-foreground text-sm max-w-sm">No new Zombie users found. All inactive users have been contacted.</p>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-black/5 dark:bg-white/5">
                                        <TableRow className="border-black/5 dark:border-white/10 hover:bg-transparent">
                                            <TableHead>Trader</TableHead>
                                            <TableHead>Registration Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingUsers.map((user) => (
                                            <TableRow key={user.id} className="border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold group-hover:text-emerald-500 transition-colors">{user.name || 'Anonymous TRADER'}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                                    {format(new Date(user.createdAt), "MMM d, yyyy \u2022 h:mm a")}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10 font-bold uppercase tracking-wider text-[10px]">
                                                        Awaiting Sweep
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="contacted" className="mt-4 outline-none">
                    <div className="rounded-xl border border-black/5 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-xl">
                        {contactedUsers.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                No history found.
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-black/5 dark:bg-white/5">
                                        <TableRow className="border-black/5 dark:border-white/10 hover:bg-transparent">
                                            <TableHead>Trader</TableHead>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contactedUsers.map((user) => (
                                            <TableRow key={user.id} className="border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold transition-colors">{user.name || 'Anonymous TRADER'}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                                    {user.zombieEmailSentAt ? format(new Date(user.zombieEmailSentAt), "MMM d, yyyy \u2022 h:mm a") : 'Unknown'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 font-bold uppercase tracking-wider text-[10px] gap-1.5 flex w-fit items-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Delivered
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
