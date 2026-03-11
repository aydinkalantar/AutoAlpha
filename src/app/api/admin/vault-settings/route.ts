import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { encryptKey } from "@/lib/encryption";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Security check: Must be an active Admin or SuperAdmin
        if (!session || !session.user || ((session.user as any).role !== 'SUPERADMIN' && (session.user as any).role !== 'ADMIN')) {
            return new NextResponse('Unauthorized access to Vault Settings', { status: 401 });
        }

        const body = await req.json();
        const { apiKey, apiSecret, walletAddress } = body;

        // The Master Key is injected via ENV variables, mimicking AWS KMS or Hashicorp Vault constraints
        const masterKey = process.env.MASTER_ENCRYPTION_KEY;
        if (!masterKey) {
            console.error('CRITICAL: MASTER_ENCRYPTION_KEY is missing from environment variables.');
            return new NextResponse('Vault key configuration error', { status: 500 });
        }

        // Encrypt sensitive payloads using the AES-256-GCM authenticated cipher
        const encryptedApiKey = apiKey ? encryptKey(apiKey, masterKey) : undefined;
        const encryptedApiSecret = apiSecret ? encryptKey(apiSecret, masterKey) : undefined;
        const encryptedWallet = walletAddress ? encryptKey(walletAddress, masterKey) : undefined;

        // Persist the encrypted text to the AdminVault singleton table
        await prisma.adminVault.upsert({
            where: { id: "singleton" },
            update: {
                ...(encryptedApiKey && { encryptedApiKey }),
                ...(encryptedApiSecret && { encryptedApiSecret }),
                ...(encryptedWallet && { encryptedWallet }),
            },
            create: {
                id: "singleton",
                encryptedApiKey: encryptedApiKey ?? null,
                encryptedApiSecret: encryptedApiSecret ?? null,
                encryptedWallet: encryptedWallet ?? null,
            }
        });

        // Retrieve IP address roughly for the intercept logs
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || "Unknown IP";

        // Audit Trail: Log the action, the specific admin, and standard metadata immediately
        await prisma.auditLog.create({
            data: {
                adminUserId: (session.user as any).id,
                actionType: 'VAULT_SETTINGS_UPDATED',
                ipAddress: ip,
            }
        });

        return NextResponse.json({ success: true, message: 'Settings securely updated and audited.' });

    } catch (error) {
        console.error('Vault Settings Encryption / Intercept Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
