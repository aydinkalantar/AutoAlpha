import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    
    if (!post) {
        return { title: 'Post Not Found | AutoAlpha' };
    }

    return {
        title: post.seoTitle || `${post.title} | AutoAlpha Blog`,
        description: post.seoDescription || post.excerpt,
        openGraph: {
            title: post.seoTitle || post.title,
            description: post.seoDescription || post.excerpt,
            images: post.coverImage ? [post.coverImage] : [],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    const post = await prisma.blogPost.findUnique({
        where: { slug }
    });

    if (!post || !post.published) {
        notFound();
    }

    return (
        <div className="pt-32 pb-40 px-6 max-w-4xl mx-auto space-y-12">
            <Link href="/blog" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground font-semibold transition-colors relative z-10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Blog
            </Link>

            <article className="relative z-10">
                <header className="space-y-8 mb-16 px-4 sm:px-0">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <div className="text-sm font-bold text-emerald-500 tracking-widest uppercase">
                            Published \u2022 {format(new Date(post.createdAt), "MMMM d, yyyy")}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-tight">
                            {post.title}
                        </h1>
                    </div>

                    {post.coverImage && (
                        <div className="aspect-[2/1] w-full rounded-3xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/10">
                            <img 
                                src={post.coverImage} 
                                alt={post.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </header>

                <div className="prose prose-lg md:prose-xl dark:prose-invert prose-headings:font-bold prose-a:text-emerald-500 hover:prose-a:text-emerald-400 mx-auto px-4 sm:px-0">
                    <ReactMarkdown>
                        {post.content}
                    </ReactMarkdown>
                </div>
            </article>

            {/* Background Glow */}
            <div className="fixed top-0 inset-x-0 h-[500px] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        </div>
    );
}
