import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
    const { code } = await params;

    return {
        title: `You've been invited to AutoAlpha by ${code}`,
        description: "Join the top algorithmic crypto copy-trading platform.",
        openGraph: {
            title: `You've been invited to AutoAlpha by ${code}`,
            description: "Join the top algorithmic crypto copy-trading platform.",
            images: ['/og-image.jpg'],
        },
        twitter: {
            card: 'summary_large_image',
            title: `You've been invited to AutoAlpha by ${code}`,
            description: "Join the top algorithmic crypto copy-trading platform.",
            images: ['/og-image.jpg'],
        }
    };
}

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const cookieStore = await cookies();

    // Plant the referral cookie
    cookieStore.set('referralCode', code, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // Expiration: 30 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    // Redirect to registration
    redirect('/register');
}
