"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required.");
    }
    return session;
}

export async function getBlogPosts() {
    await verifyAdmin();
    return await prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function createBlogPost(data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    published?: boolean;
}) {
    await verifyAdmin();
    
    // Ensure slug is unique
    const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
    if (existing) throw new Error("A post with this slug already exists.");

    const post = await prisma.blogPost.create({
        data: {
            ...data,
        }
    });

    revalidatePath("/admin/marketing/blog");
    revalidatePath("/blog");
    return { success: true, id: post.id };
}

export async function updateBlogPost(id: string, data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    published?: boolean;
}) {
    await verifyAdmin();
    
    const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== id) throw new Error("A post with this slug already exists.");

    await prisma.blogPost.update({
        where: { id },
        data: {
            ...data,
        }
    });

    revalidatePath("/admin/marketing/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug}`);
    return { success: true };
}

export async function togglePublishStatus(id: string) {
    await verifyAdmin();
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new Error("Post not found");

    await prisma.blogPost.update({
        where: { id },
        data: { published: !post.published }
    });

    revalidatePath("/admin/marketing/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return { success: true };
}

export async function deleteBlogPost(id: string) {
    await verifyAdmin();
    await prisma.blogPost.delete({ where: { id } });
    
    revalidatePath("/admin/marketing/blog");
    revalidatePath("/blog");
    return { success: true };
}
