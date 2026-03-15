"use client";

import React, { useState } from "react";
import { AuditLog, BroadcastLog } from "@prisma/client";
import { Terminal, History, ShieldAlert, MonitorPlay, Mails, Download, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AdminLogsClientProps {
    auditLogs: AuditLog[];
    broadcastLogs: BroadcastLog[];
}

export default function AdminLogsClient({ auditLogs, broadcastLogs }: AdminLogsClientProps) {
    const [activeTab, setActiveTab] = useState<string>("audits");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAuditLogs = auditLogs.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            log.adminUserId.toLowerCase().includes(query) ||
            log.actionType.toLowerCase().includes(query) ||
            (log.ipAddress && log.ipAddress.toLowerCase().includes(query))
        );
    });

    const exportToCsv = () => {
        if (activeTab === "audits") {
            const headers = ['ID', 'Timestamp', 'Admin Subject', 'Action Type', 'IP Address'];
            const rows = filteredAuditLogs.map(log => [
                log.id,
                new Date(log.timestamp).toISOString(),
                log.adminUserId,
                log.actionType,
                log.ipAddress || 'Unknown'
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const headers = ['ID', 'Dispatch Time', 'Subject Line', 'Audience', 'Volume'];
            const rows = broadcastLogs.map(log => [
                log.id,
                new Date(log.sentAt).toISOString(),
                `"${log.subject.replace(/"/g, '""')}"`,
                log.audience,
                log.sentCount.toString()
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `broadcast_logs_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">System Logs</h1>
                <p className="text-foreground/60">Immutable ledger of administrative actions and system-wide broadcasts.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <TabsList className="flex w-full md:w-auto h-auto no-scrollbar bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                        <TabsTrigger value="audits" className="px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap data-[state=active]:bg-white data-[state=active]:dark:bg-white/10 data-[state=active]:shadow-sm data-[state=active]:text-foreground text-foreground/50 hover:text-foreground flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            Admin Audits
                        </TabsTrigger>
                        <TabsTrigger value="broadcasts" className="px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap data-[state=active]:bg-white data-[state=active]:dark:bg-white/10 data-[state=active]:shadow-sm data-[state=active]:text-foreground text-foreground/50 hover:text-foreground flex items-center gap-2">
                            <Mails className="w-4 h-4" />
                            Broadcasts
                        </TabsTrigger>
                    </TabsList>

                    <button
                        onClick={exportToCsv}
                        className="flex items-center justify-center gap-2 px-5 py-2 w-full md:w-auto bg-foreground text-background rounded-xl hover:bg-foreground/80 transition-all font-bold text-sm shadow-md shadow-black/10 dark:shadow-white/5 whitespace-nowrap"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                <TabsContent value="audits" className="mt-6 outline-none w-full">
                    <div className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-black/5 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 text-white shrink-0">
                                    <Terminal className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Audit Trail</h2>
                                    <p className="text-sm text-foreground/60">Strictly tracks all sensitive mutations by administrative accounts.</p>
                                </div>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all placeholder:text-foreground/30"
                                />
                            </div>
                        </div>

                        {filteredAuditLogs.length === 0 ? (
                            <div className="p-12 text-center text-foreground/40 font-medium">
                                No administrative actions found.
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-full">
                                    <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground border-b border-black/5 dark:border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 whitespace-nowrap">Timestamp</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Admin Subject</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Action Type</th>
                                            <th className="px-6 py-4 whitespace-nowrap text-right">IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/10">
                                        {filteredAuditLogs.map((log) => (
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

                <TabsContent value="broadcasts" className="mt-6 outline-none w-full">
                    <div className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
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
                                <table className="w-full text-left border-collapse min-w-full">
                                    <thead className="bg-black/5 dark:bg-white/5 text-xs font-bold uppercase text-muted-foreground border-b border-black/5 dark:border-white/10">
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
