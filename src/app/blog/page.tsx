import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Blog | AutoAlpha",
    description: "Insights, strategies, and updates from the AutoAlpha quantitative trading team.",
};

export default async function BlogIndexPage() {
    const posts = await prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="pt-32 pb-40 px-6 max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
                <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tight">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Alpha</span> Journal
                </h1>
                <p className="text-xl text-foreground/60 leading-relaxed max-w-2xl mx-auto">
                    Quantitative analysis, algorithm breakdowns, and release notes straight from our engineering team.
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-20 text-foreground/50 text-lg relative z-10">
                    No articles published yet. Check back soon.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 w-full px-4 sm:px-0">
                    {posts.map((post) => (
                        <Link 
                            href={`/blog/${post.slug}`} 
                            key={post.id}
                            className="group bg-white/50 dark:bg-[#0B0D14]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden hover:border-black/20 dark:hover:border-white/20 hover:shadow-2xl transition-all duration-300 flex flex-col"
                        >
                            <div className="aspect-video w-full bg-black/5 dark:bg-white/5 overflow-hidden relative">
                                {post.coverImage ? (
                                    <img 
                                        src={post.coverImage} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <div className="text-xs font-bold text-foreground/40 mb-3 tracking-widest uppercase">
                                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-4 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-cyan-400 transition-all">
                                    {post.title}
                                </h3>
                                <p className="text-foreground/70 leading-relaxed mb-8 flex-grow">
                                    {post.excerpt}
                                </p>
                                <div className="inline-flex items-center text-sm font-bold text-foreground gap-2 pt-4 border-t border-black/5 dark:border-white/10 mt-auto">
                                    Read Article
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            
            {/* Background Glow */}
            <div className="fixed top-1/3 -right-64 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 -left-64 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        </div>
    );
}
