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
                username: { label: "Email", type: "email", placeholder: "investor@autoalpha.ai" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                // Temporary insecure fallback for a dummy admin user if their password isn't hashed yet
                if (credentials?.username === "admin" && credentials?.password === "admin") {
                    const adminUser = await prisma.user.upsert({
                        where: { email: "admin@autoalpha.ai" },
                        update: {},
                        create: {
                            email: "admin@autoalpha.ai",
                            role: "ADMIN",
                        }
                    });
                    return { id: adminUser.id, email: adminUser.email, role: adminUser.role };
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

                return { id: user.id, email: user.email, role: user.role };
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
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        }
    }
};
