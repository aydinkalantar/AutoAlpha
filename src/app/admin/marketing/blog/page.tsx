import React from "react";
import { getBlogPosts } from "./actions";
import BlogTable from "./BlogTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
    const posts = await getBlogPosts();

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/marketing" className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors">
                            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Blog CMS</h1>
                    </div>
                    <p className="text-foreground/60 text-lg">Manage SEO-optimized articles and content for the public blog.</p>
                </div>
                <Link
                    href="/admin/marketing/blog/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/80 transition-all shadow-xl shadow-black/10 dark:shadow-white/10"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Post
                </Link>
            </div>

            <div className="relative z-10">
                <BlogTable posts={posts} />
            </div>
        </div>
    );
}
