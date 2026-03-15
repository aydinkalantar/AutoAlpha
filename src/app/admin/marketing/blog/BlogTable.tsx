"use client";

import { BlogPost } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";
import { togglePublishStatus, deleteBlogPost } from "./actions";

export default function BlogTable({ posts }: { posts: BlogPost[] }) {
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
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            <th className="p-5 text-sm font-semibold text-foreground/60 whitespace-nowrap">Title</th>
                            <th className="p-5 text-sm font-semibold text-foreground/60 whitespace-nowrap">Status</th>
                            <th className="p-5 text-sm font-semibold text-foreground/60 whitespace-nowrap">Date</th>
                            <th className="p-5 text-sm font-semibold text-foreground/60 whitespace-nowrap text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/10">
                        {posts.map((post) => (
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
                                <td className="p-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/marketing/blog/${post.id}`}
                                            className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground rounded-xl transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm("Are you sure you want to delete this post?")) {
                                                    await deleteBlogPost(post.id);
                                                }
                                            }}
                                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
