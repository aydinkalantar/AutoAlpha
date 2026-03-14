import { prisma } from "@/lib/prisma";
import BlogEditor from "./BlogEditor";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const isNew = id === "new";

    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/login");
    }

    let post = null;
    if (!isNew) {
        post = await prisma.blogPost.findUnique({ where: { id } });
        if (!post) notFound();
    }

    return (
        <BlogEditor post={post} />
    );
}
