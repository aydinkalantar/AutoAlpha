import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Basic in-memory rate limiting strategy map
// Note: In serverless (Vercel) this memory is wiped on instance cold start
// but provides basic spam protection across warm instances.
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // --- RATE LIMITING ---
    if (pathname.startsWith('/api/webhook/tradingview')) {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown-ip';
        const now = Date.now();
        const windowSize = 60 * 1000; // 1 minute
        const maxRequests = 50;

        let record = rateLimitMap.get(ip);

        // Clean up old window
        if (record && now > record.resetTime) {
            record = undefined;
        }

        if (!record) {
            record = { count: 0, resetTime: now + windowSize };
        }

        record.count++;
        rateLimitMap.set(ip, record);

        if (record.count > maxRequests) {
            return new NextResponse(JSON.stringify({ error: "Too many requests. Rate limit is 50 req / min." }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
                }
            });
        }
    }

    // --- ROUTE PROTECTION ---
    // Extract token via NextAuth
    // Workaround for Cloudflare Tunnels: NextAuth sets Secure cookies over HTTPS tunnels,
    // but the Edge runtime reads `localhost:3000` from `.env`, looking for insecure cookies and failing blindly.
    const isSecure = req.url.startsWith('https://') || req.headers.get('x-forwarded-proto') === 'https';

    // Attempt standard getToken
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production' || isSecure
    });

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        if (token.role !== 'ADMIN') {
            // Unauthenticated or not an admin, boot them securely to dashboard or home
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    // Protect /dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        // Access allowed for USER or ADMIN
    }

    // Let other requests pass through gracefully
    return NextResponse.next();
}

/**
 * Configure which routes this middleware applies to.
 * This ensures we don't accidentally intercept static assets, images, etc.
 */
export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*',
        '/api/webhook/tradingview/:path*'
    ]
};
