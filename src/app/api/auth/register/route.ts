import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/emails";
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { email, password, referralCode: bodyReferralCode } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ message: "An account with this email already exists." }, { status: 400 });
        }

        const cookieStore = await cookies();
        const cookieReferralCode = cookieStore.get('autoalpha_ref')?.value;
        const referralCode = bodyReferralCode || cookieReferralCode;

        let referredById = null;

        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode }
            });
            if (referrer) {
                referredById = referrer.id;
            }
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Fetch Global System Configuration for Welcome Bonus
        const rawConfig = await prisma.systemConfig.findUnique({
            where: { id: "global" }
        });
        const config = rawConfig as any;

        const isBonusEnabled = config?.welcomeBonusEnabled ?? false;
        const bonusAmount = config?.welcomeBonusAmount || 50.0;

        let newUser;

        // Atomically create user, apply logic, and credit gas tank
        if (isBonusEnabled && bonusAmount > 0) {
            newUser = await prisma.$transaction(async (tx: any) => {
                const created = await tx.user.create({
                    data: {
                        email,
                        passwordHash,
                        referredById,
                        usdtBalance: bonusAmount // Intentionally inject the welcome bonus gas tank credit
                    }
                });

                // Generate rigid audit trail showing exactly *why* they got this free capital
                await tx.ledger.create({
                    data: {
                        userId: created.id,
                        amount: bonusAmount,
                        currency: 'USDT',
                        description: 'Promo Campaign: Welcome Bonus Credit',
                        type: 'DEPOSIT'
                    }
                });

                return created;
            });
        } else {
            newUser = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    referredById
                }
            });
        }

        // Asynchronously fire the Universal Resend Template, do not block the API payload response
        sendWelcomeEmail(newUser.email, isBonusEnabled, bonusAmount).catch((e: any) => {
            console.error("Non-fatal: Resend Background Job Failed", e);
        });

        return NextResponse.json({ message: "User created successfully", userId: newUser.id }, { status: 201 });

    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ message: "An error occurred during registration." }, { status: 500 });
    }
}
