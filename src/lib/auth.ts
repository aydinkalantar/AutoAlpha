import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";



export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Email", type: "text", placeholder: "info@autoalpha.trade" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                // Temporary insecure fallback for a dummy admin user if their password isn't hashed yet
                if (credentials?.username === "admin" && credentials?.password === "admin") {
                    try {
                        const adminUser = await prisma.user.upsert({
                            where: { email: "admin@autoalpha.trade" },
                            update: {},
                            create: {
                                email: "admin@autoalpha.trade",
                                role: "ADMIN",
                                isActive: true,
                            }
                        });
                        return { id: adminUser.id, email: adminUser.email, role: adminUser.role, isActive: adminUser.isActive };
                    } catch (e) {
                        console.warn("Database is offline. Using mock local Admin session.");
                        return { id: "local-offline-admin", email: "kalantarbros@gmail.com", role: "ADMIN", isActive: true };
                    }
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.username }
                });

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isValid) {
                    return null;
                }

                return { id: user.id, email: user.email, role: user.role, isActive: user.isActive };
            }
        })
    ],
    pages: {
        signIn: '/login',
        newUser: '/register'
    },
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.isActive = (user as any).isActive;
            }
            // Hardcode Admin override for the owner
            if (token.email === "kalantarbros@gmail.com") {
                token.role = "ADMIN";
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).isActive = token.isActive;
            }
            return session;
        }
    }
};
