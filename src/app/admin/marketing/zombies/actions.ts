"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";
import ZombieReminderEmail from "../../../../../emails/ZombieReminderEmail";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { role: true },
    });

    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
        throw new Error("Insufficient permissions");
    }
}

export async function getZombieStats() {
    await verifyAdmin();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pendingZombies = await prisma.user.count({
        where: {
            isActive: false,
            hasCompletedOnboarding: false,
            createdAt: { lt: twentyFourHoursAgo },
            zombieEmailSentAt: null,
            role: "USER",
        },
    });

    const contactedZombies = await prisma.user.count({
        where: {
            zombieEmailSentAt: { not: null },
        },
    });

    // Provide a detailed list of pending zombies for the admin table
    const pendingUsers = await prisma.user.findMany({
        where: {
            isActive: false,
            hasCompletedOnboarding: false,
            createdAt: { lt: twentyFourHoursAgo },
            zombieEmailSentAt: null,
            role: "USER",
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    const contactedUsers = await prisma.user.findMany({
        where: {
            zombieEmailSentAt: { not: null },
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            zombieEmailSentAt: true,
        },
        orderBy: { zombieEmailSentAt: "desc" },
        take: 50, // Limit history
    });

    return {
        metrics: {
            pending: pendingZombies,
            contacted: contactedZombies,
        },
        pendingUsers,
        contactedUsers,
    };
}

export async function triggerManualZombieSweep() {
    await verifyAdmin();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const zombies = await prisma.user.findMany({
        where: {
            isActive: false,
            hasCompletedOnboarding: false,
            createdAt: { lt: twentyFourHoursAgo },
            zombieEmailSentAt: null,
            role: "USER",
        },
        take: 50, // Safety cap
    });

    if (zombies.length === 0) {
        return { success: true, message: "No pending zombie users found.", count: 0 };
    }

    let successCount = 0;

    for (const user of zombies) {
        try {
            const { error } = await resend.emails.send({
                from: "AutoAlpha Engineering <engineering@autoalpha.ai>",
                to: [user.email],
                subject: "Action Required: Complete your AutoAlpha Setup",
                react: ZombieReminderEmail({ userName: user.name || "Trader" }),
            });

            if (error) {
                console.error(`Admin Manual Sweep: Failed to email zombie ${user.email}:`, error);
                continue;
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { zombieEmailSentAt: new Date() },
            });

            successCount++;
        } catch (err) {
            console.error(`Admin Manual Sweep: Runtime error emailing zombie ${user.email}:`, err);
        }
    }

    return { 
        success: true, 
        message: `Successfully broadcasted to ${successCount} zombie users!`,
        count: successCount 
    };
}
