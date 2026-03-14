"use client";

import { BlogPost } from "@prisma/client";
import { useState } from "react";
import { createBlogPost, updateBlogPost } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

function sluggify(str: string) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export default function BlogEditor({ post }: { post: BlogPost | null }) {
    const router = useRouter();
    const isNew = !post;
    
    const [title, setTitle] = useState(post?.title || "");
    const [slug, setSlug] = useState(post?.slug || "");
    const [coverImage, setCoverImage] = useState(post?.coverImage || "");
    const [excerpt, setExcerpt] = useState(post?.excerpt || "");
    const [content, setContent] = useState(post?.content || "");
    const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "");
    const [seoDescription, setSeoDescription] = useState(post?.seoDescription || "");
    const [published, setPublished] = useState(post?.published || false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (isNew && !slug) {
            setSlug(sluggify(e.target.value));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const payload = {
                title, slug: slug || sluggify(title), coverImage, excerpt, content, seoTitle, seoDescription, published
            };

            if (isNew) {
                await createBlogPost(payload);
            } else {
                await updateBlogPost(post.id, payload);
            }
            router.push("/admin/marketing/blog");
        } catch (err: any) {
            setError(err.message || "Failed to save post");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <Link href="/admin/marketing/blog" className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors">
                        <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        {isNew ? "Write New Post" : "Edit Post"}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer gap-2">
                        <span className="text-sm font-bold text-foreground/60">{published ? "Published" : "Draft"}</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only peer" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                            <div className="w-11 h-6 bg-black/10 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                    </label>
                    <button 
                        onClick={handleSave} 
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/80 disabled:opacity-50 transition-all shadow-xl"
                    >
                        {isSubmitting ? "Saving..." : "Save Post"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl font-medium relative z-10">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Left Col - Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl">
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-foreground/60 px-2 block mb-2">Post Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="The Future of Algorithmic Trading"
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1.2rem] px-5 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-xl"
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm font-semibold text-foreground/60 px-2 block mb-2">Content (Markdown)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your article here..."
                                    className="w-full h-[600px] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1.2rem] px-5 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm leading-relaxed resize-y"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col - Meta settings */}
                <div className="space-y-6">
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-6">
                        <h3 className="text-lg font-bold text-foreground">Post Settings</h3>
                        
                        <div>
                            <label className="text-sm font-semibold text-foreground/60 px-2 block mb-2">Slug URL</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="the-future-of-trading"
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-foreground/60 px-2 block mb-2">Cover Image URL</label>
                            <input
                                type="text"
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            {coverImage && (
                                <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-black/5 dark:border-white/10">
                                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-foreground/60 px-2 block mb-2">Short Excerpt</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="A brief summary for the blog card..."
                                rows={3}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-6">
                        <h3 className="text-lg font-bold text-foreground">SEO Overrides</h3>
                        
                        <div>
                            <label className="text-sm font-semibold text-foreground/60 px-2 block mb-2">SEO Title</label>
                            <input
                                type="text"
                                value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                                placeholder="(Defaults to Post Title)"
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-foreground/60 px-2 block mb-2">SEO Description</label>
                            <textarea
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                                placeholder="(Defaults to Excerpt)"
                                rows={2}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
