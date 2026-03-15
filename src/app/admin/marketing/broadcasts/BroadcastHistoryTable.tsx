import React from 'react';
import { BroadcastLog } from '@prisma/client';
import { History, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function BroadcastHistoryTable({ logs }: { logs: BroadcastLog[] }) {
    if (logs.length === 0) {
        return (
            <div className="text-center p-12 bg-white/5 dark:bg-black/20 rounded-[2.5rem] border border-black/5 dark:border-white/5 border-dashed relative z-10">
                <History className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/40 font-medium">No previous broadcasts found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/20 relative z-10">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white">
                    <History className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Broadcast History</h2>
                    <p className="text-foreground/60">Log of all previously sent email campaigns.</p>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-black/5 dark:border-white/10 text-foreground/60 text-sm">
                            <th className="px-4 py-4 font-semibold">Subject</th>
                            <th className="px-4 py-4 font-semibold text-center">Audience</th>
                            <th className="px-4 py-4 font-semibold text-center">Sent Count</th>
                            <th className="px-4 py-4 font-semibold text-right">Sent At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-4 py-4">
                                    <p className="font-semibold text-foreground truncate max-w-[300px]">{log.subject}</p>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="inline-flex items-center justify-center bg-black/5 dark:bg-white/10 text-foreground/80 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {log.audience === 'all' ? 'All Users' : log.audience === 'active' ? 'Active' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-foreground/80 font-medium">
                                        <Users className="w-4 h-4 text-foreground/50" />
                                        {log.sentCount}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5 text-foreground/60 text-sm">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatDistanceToNow(new Date(log.sentAt), { addSuffix: true })}
                                    </div>
                                    <p className="text-[10px] text-foreground/40 mt-1">
                                        {new Date(log.sentAt).toLocaleDateString()} {new Date(log.sentAt).toLocaleTimeString()}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
