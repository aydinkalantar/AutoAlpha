"use client";

import { useState, useMemo } from 'react';
import { BlogPost } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";
import { togglePublishStatus, deleteBlogPost } from "./actions";
import { Search, MoreHorizontal } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function BlogTable({ posts }: { posts: BlogPost[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            if (statusFilter === 'PUBLISHED' && !post.published) return false;
            if (statusFilter === 'DRAFT' && post.published) return false;
            return true;
        });
    }, [posts, searchQuery, statusFilter]);
    if (posts.length === 0) {
        return (
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-12 text-center shadow-2xl">
                <svg className="w-16 h-16 mx-auto text-foreground/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-xl font-bold text-foreground mb-2">No Blog Posts Yet</h3>
                <p className="text-foreground/60 mb-6">Create your first SEO-optimized article to attract more traffic.</p>
                <Link
                    href="/admin/marketing/blog/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/80 transition-all"
                >
                    Write Post
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input 
                            type="text" 
                            placeholder="Search articles..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm font-medium"
                        />
                    </div>
                    <select 
                        aria-label="Filter Posts by Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm font-medium sm:w-48 appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                    </select>
                </div>
                
                <Link
                    href="/admin/marketing/blog/new"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/80 transition-all shadow-xl shadow-black/10 dark:shadow-white/10 whitespace-nowrap"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Post
                </Link>
            </div>

            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                                <th className="p-5 text-sm font-semibold text-foreground/60 whitespace-nowrap">Title</th>
                                <th className="p-5 text-sm font-semibold text-foreground/60 whitespace-nowrap">Status</th>
                                <th className="p-5 text-sm font-semibold text-foreground/60 whitespace-nowrap">Date</th>
                                <th className="p-5 text-sm font-semibold text-foreground/60 whitespace-nowrap text-right w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/10">
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-foreground/40 font-medium">
                                        No articles match your search criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        {post.coverImage ? (
                                            <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 flex-shrink-0 overflow-hidden relative">
                                                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-foreground text-lg mb-1">{post.title}</p>
                                            <p className="text-sm font-medium text-foreground/50">/{post.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <button
                                        onClick={async () => {
                                            await togglePublishStatus(post.id);
                                        }}
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                            post.published
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                                        }`}
                                    >
                                        {post.published ? (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                                                Published
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
                                                Draft
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="p-5 text-foreground/70 font-medium">
                                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                                </td>
                                <td className="p-5 text-right w-24">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="w-8 h-8 flex justify-center items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-auto focus:outline-none">
                                            <MoreHorizontal className="w-5 h-5 text-foreground/60" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-xl shadow-xl z-[100] p-1.5">
                                            <DropdownMenuItem asChild className="cursor-pointer font-medium p-2 focus:bg-black/5 dark:focus:bg-white/5 text-foreground">
                                                <Link href={`/admin/marketing/blog/${post.id}`}>
                                                    Edit Post
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="cursor-pointer font-medium p-2 focus:bg-black/5 dark:focus:bg-white/5 text-foreground">
                                                <Link href={`/blog/${post.slug}`}>
                                                    Preview
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-black/5 dark:bg-white/10 my-1.5" />
                                            <DropdownMenuItem 
                                                onClick={async () => {
                                                    if (window.confirm("Are you sure you want to delete this post?")) {
                                                        await deleteBlogPost(post.id);
                                                    }
                                                }}
                                                className="cursor-pointer font-medium text-rose-500 focus:text-rose-600 focus:bg-rose-500/10 dark:focus:bg-rose-500/10 p-2"
                                            >
                                                Delete Post
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
}
