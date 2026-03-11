import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

import { NextRequest } from "next/server";

interface RouteHandlerContext {
    params: Promise<{ nextauth: string[] }>;
}

const handler = async (req: NextRequest, context: RouteHandlerContext) => {
    // Dynamically set NEXTAUTH_URL to match Cloudflare Tunnel or ngrok forwarded domains
    // This prevents NextAuth from redirecting callbacks to localhost:3000
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";

    if (forwardedHost) {
        process.env.NEXTAUTH_URL = `${forwardedProto}://${forwardedHost}`;
    }

    return NextAuth(authOptions)(req, context as any);
};

export { handler as GET, handler as POST };
