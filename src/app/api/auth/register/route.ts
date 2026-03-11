import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';



export async function POST(req: Request) {
    try {
        const { email, password, referralCode } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ message: "An account with this email already exists." }, { status: 400 });
        }

        let referredById = null;

        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode }
            });
            if (referrer) {
                referredById = referrer.id;
            } else {
                return NextResponse.json({ message: "Invalid referral code." }, { status: 400 });
            }
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                referredById
            }
        });

        return NextResponse.json({ message: "User created successfully", userId: newUser.id }, { status: 201 });

    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ message: "An error occurred during registration." }, { status: 500 });
    }
}
