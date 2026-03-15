"use client";

import React from "react";
import { AuditLog, BroadcastLog } from "@prisma/client";
import { Terminal, History, ShieldAlert, MonitorPlay, Mails } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AdminLogsClientProps {
    auditLogs: AuditLog[];
    broadcastLogs: BroadcastLog[];
}

export default function AdminLogsClient({ auditLogs, broadcastLogs }: AdminLogsClientProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">System Logs</h1>
                <p className="text-foreground/60">Immutable ledger of administrative actions and system-wide broadcasts.</p>
            </div>

            <Tabs defaultValue="audits" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                    <TabsTrigger value="audits" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Admin Audits
                    </TabsTrigger>
                    <TabsTrigger value="broadcasts" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-semibold flex items-center gap-2">
                        <Mails className="w-4 h-4" />
                        Broadcasts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="audits" className="mt-6 outline-none">
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 text-white shrink-0">
                                <Terminal className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Audit Trail</h2>
                                <p className="text-sm text-foreground/60">Strictly tracks all sensitive mutations by administrative accounts.</p>
                            </div>
                        </div>

                        {auditLogs.length === 0 ? (
                            <div className="p-12 text-center text-foreground/40 font-medium">
                                No administrative actions recorded yet.
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-4 whitespace-nowrap">Timestamp</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Admin Subject</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Action Type</th>
                                            <th className="px-6 py-4 whitespace-nowrap text-right">IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/10">
                                        {auditLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground/80">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                                                        <span className="text-xs text-foreground/40">{new Date(log.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                                                    {log.adminUserId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="outline" className="text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10 font-bold uppercase tracking-wider text-[10px] gap-1.5 flex w-fit items-center">
                                                        <MonitorPlay className="w-3 h-3" />
                                                        {log.actionType}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-foreground/50 font-mono">
                                                    {log.ipAddress || 'Unknown'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="broadcasts" className="mt-6 outline-none">
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white shrink-0">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Campaign Log</h2>
                                <p className="text-sm text-foreground/60">Historical record of all mass outbound email pipelines.</p>
                            </div>
                        </div>

                        {broadcastLogs.length === 0 ? (
                            <div className="p-12 text-center text-foreground/40 font-medium">
                                No network broadcasts recorded yet.
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-4 whitespace-nowrap">Dispatch Time</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Subject Line</th>
                                            <th className="px-6 py-4 whitespace-nowrap text-center">Audience Filter</th>
                                            <th className="px-6 py-4 whitespace-nowrap text-right">Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/10">
                                        {broadcastLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground/80">{formatDistanceToNow(new Date(log.sentAt), { addSuffix: true })}</span>
                                                        <span className="text-xs text-foreground/40">{new Date(log.sentAt).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-foreground max-w-[250px] truncate">
                                                    {log.subject}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center justify-center bg-black/5 dark:bg-white/10 text-foreground/80 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                                        {log.audience === 'all' ? 'Entire Network' : log.audience === 'active' ? 'Active Traders' : 'Pending Leads'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                                        {log.sentCount.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
