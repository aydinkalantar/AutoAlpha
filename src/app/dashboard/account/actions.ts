"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function changePassword(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) throw new Error("Missing fields");
    if (newPassword.length < 8) throw new Error("New password must be at least 8 characters");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    if (!user.passwordHash) throw new Error("This account uses external authentication.");

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new Error("Incorrect current password");

    const newHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash }
    });

    return { success: true };
}

export async function deleteAccount(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const userId = (session.user as any).id;
    const password = formData.get("password") as string;
    const confirmText = formData.get("confirmText") as string;

    if (confirmText !== "DELETE") throw new Error("You must type DELETE to confirm");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.passwordHash) {
        if (!password) throw new Error("Password is required to delete account");
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) throw new Error("Incorrect password");
    }

    // Due to onDelete: Cascade in Prisma schema, this automatically deletes their keys, positions, etc.
    await prisma.user.delete({ where: { id: userId } });

    return { success: true };
}
