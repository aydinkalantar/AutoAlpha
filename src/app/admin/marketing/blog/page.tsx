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
                    <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Blog CMS</h1>
                    <p className="text-foreground/60 text-lg">Manage SEO-optimized articles and content for the public blog.</p>
                </div>
            </div>

            <div className="relative z-10">
                <BlogTable posts={posts} />
            </div>
        </div>
    );
}
