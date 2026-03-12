import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';

export default async function WaitlistPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    if ((session.user as any).isActive || (session.user as any).role === "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="flex bg-[#F5F5F7] min-h-screen text-[#1D1D1F] items-center justify-center p-6">
            <div className="bg-white max-w-xl w-full rounded-[2.5rem] p-12 shadow-2xl shadow-black/[0.03] space-y-8 text-center border border-black/5">
                <div className="w-20 h-20 mx-auto bg-[#F5F5F7] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">You're on the Waitlist</h1>
                    <p className="text-black/50 font-medium text-lg leading-relaxed max-w-sm mx-auto">
                        Your AutoAlpha account has been successfully created. However, due to limited capacity, access to the trading terminal is currently by invitation only. 
                        <br/><br/>
                        An administrator will securely review and activate your account shortly.
                    </p>
                </div>
                
                <div className="pt-6">
                    <Link href="/api/auth/signout" className="inline-block text-sm font-bold bg-black dark:bg-[#1D1D1F] text-white px-8 py-4 rounded-full hover:opacity-80 transition-opacity w-full md:w-auto">
                        Sign Out
                    </Link>
                </div>
            </div>
        </div>
    );
}
