"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSEOForRoute(route: string) {
  try {
    const seo = await prisma.sEOSettings.findUnique({
      where: { route },
    });
    return seo;
  } catch (error) {
    console.error("Error fetching SEO for route:", route, error);
    return null;
  }
}

export async function getAllSEOSettings() {
  try {
    const settings = await prisma.sEOSettings.findMany({
      orderBy: { route: "asc" },
    });
    return settings;
  } catch (error) {
    console.error("Error fetching all SEO settings:", error);
    return [];
  }
}

export async function saveSEOSettings(data: {
  id?: string;
  route: string;
  title: string;
  description: string;
  keywords: string;
  ogImageUrl?: string | null;
}) {
  try {
    const { id, route, title, description, keywords, ogImageUrl } = data;

    if (id) {
      // Update existing
      await prisma.sEOSettings.update({
        where: { id },
        data: {
          route,
          title,
          description,
          keywords,
          ogImageUrl,
        },
      });
    } else {
      // Create new (or use upsert if we only match on route)
      await prisma.sEOSettings.upsert({
        where: { route },
        update: {
          title,
          description,
          keywords,
          ogImageUrl,
        },
        create: {
          route,
          title,
          description,
          keywords,
          ogImageUrl,
        },
      });
    }

    // Revalidate the specific route so the fresh metadata is loaded
    revalidatePath(route);
    // Also revalidate the admin path to update the table
    revalidatePath("/admin/marketing/seo");

    return { success: true };
  } catch (error) {
    console.error("Error saving SEO settings:", error);
    return { success: false, error: "Failed to save SEO settings." };
  }
}
