import { prisma } from '@/lib/prisma';
import LandingPageClient from './LandingPageClient';

export default async function Page() {
    // Fetch active strategies marked as public
    // Circuit breaker: In the Railway Docker build, DATABASE_URL is set to a "mock" string.
    // Next.js ignores `force-dynamic` on the index route and still aggressively evaluates this query, crashing the build.
    let initialStrategies: any[] = [];
    if (!process.env.DATABASE_URL?.includes('mock')) {
        try {
            initialStrategies = await prisma.strategy.findMany({
                where: {
                    isPublic: true,
                    isActive: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (e) {
            console.warn("Could not connect to database on landing page. Returning empty strategies list.");
        }
    }
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "AutoAlpha",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "WebBrowser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Can AutoAlpha steal my crypto?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. You provide us with \"Trade-Only\" API keys. Binance/Bybit physically blocks us from withdrawing your funds."
                }
            },
            {
                "@type": "Question",
                "name": "What if my Gas Tank runs out?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our engine will simply pause executing new trades on your account until you top up your USDT/USDC balance. You will receive an email warning before this happens."
                }
            },
            {
                "@type": "Question",
                "name": "Do I need to keep my computer on?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Not at all. AutoAlpha is a 100% cloud-based SaaS. Once you subscribe, our servers handle the 24/7 execution."
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <LandingPageClient initialStrategies={initialStrategies} />
        </>
    );
}
