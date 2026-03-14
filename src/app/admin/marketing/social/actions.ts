"use server";

import { prisma } from "@/lib/prisma";
import { TwitterApi } from "twitter-api-v2";

/**
 * Queries the database for the Strategy with the highest expected ROI over the last 7 days.
 * Returns null if no strategy has a positive ROI.
 */
export async function getTopPerformingStrategy() {
  try {
    const topStrategy = await prisma.strategy.findFirst({
      where: {
        isActive: true,
        isPublic: true,
        expectedRoiPercentage: {
          gt: 0,
        },
      },
      orderBy: {
        expectedRoiPercentage: "desc",
      },
      select: {
        id: true,
        name: true,
        expectedRoiPercentage: true,
        winRatePercentage: true,
      },
    });

    return topStrategy;
  } catch (error) {
    console.error("Error fetching top performing strategy:", error);
    return null;
  }
}

/**
 * Server action to publish a tweet using the Twitter API v2.
 */
export async function publishToTwitter(tweetText: string) {
  try {
    if (!tweetText || tweetText.trim().length === 0) {
      return { success: false, error: "Tweet text cannot be empty" };
    }

    const appKey = process.env.TWITTER_API_KEY;
    const appSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      return { success: false, error: "Twitter API credentials are not fully configured in the environment." };
    }

    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });

    const rwClient = client.readWrite;
    const { data: createdTweet } = await rwClient.v2.tweet(tweetText);
    
    return { success: true, tweetId: createdTweet.id };
  } catch (error: any) {
    console.error("Error publishing to Twitter:", error);
    return { success: false, error: error.message || "Failed to publish tweet" };
  }
}
