"use server";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/emails";

export async function sendBroadcastEmail({
  subject,
  body,
  audience,
}: {
  subject: string;
  body: string;
  audience: string;
}) {
  try {
    // 1. Fetch Users based on audience
    let users: { email: string }[] = [];

    if (audience === "all") {
      users = await prisma.user.findMany({
        select: { email: true },
      });
    } else if (audience === "active") {
      users = await prisma.user.findMany({
        where: {
          exchangeKeys: {
            some: {},
          },
        },
        select: { email: true },
      });
    } else if (audience === "pending") {
      users = await prisma.user.findMany({
        where: {
          exchangeKeys: {
            none: {},
          },
        },
        select: { email: true },
      });
    } else {
      return { success: false, error: "Invalid audience selected." };
    }

    if (users.length === 0) {
      return { success: false, error: "No users found for this audience." };
    }

    // 2. Prepare emails for Resend
    const emailsToSend = users.map((user) => ({
      from: "AutoAlpha Updates <updates@autoalpha.trade>",
      to: [user.email],
      subject: subject,
      html: body,
    }));

    // 3. Batch and Send (Resend allows up to 100 emails per batch)
    // If resend is null (no API key), we just mock it.
    if (!resend) {
      console.log("Mocking batch send for", emailsToSend.length, "emails.");
    } else {
      const BATCH_SIZE = 100;
      for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
        const batch = emailsToSend.slice(i, i + BATCH_SIZE);
        const { error } = await resend.batch.send(batch);
        
        if (error) {
          console.error("Resend Batch Error:", error);
          return { success: false, error: error.message };
        }
      }
    }

    // 4. Log the broadcast
    await prisma.broadcastLog.create({
      data: {
        subject,
        audience,
        sentCount: users.length,
      },
    });

    return { success: true, count: users.length };
  } catch (error) {
    console.error("Broadcast Error:", error);
    return { success: false, error: "Failed to send broadcast." };
  }
}
