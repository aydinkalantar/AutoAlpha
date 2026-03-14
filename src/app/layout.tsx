import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "@/components/SessionProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TrackingProvider } from "@/components/TrackingProvider";
import PWASplashScreen from "@/components/PWASplashScreen";

export const dynamic = 'force-dynamic';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { getSEOForRoute } from "./actions/seo";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOForRoute("/layout-fallback");

  const defaultTitle = "AutoAlpha | Institutional Crypto Copy-Trading";
  const defaultDesc = "Automated crypto trading, Binance API bot, algorithmic copy-trading, non-custodial.";
  
  return {
    metadataBase: new URL('https://autoalpha.ai'),
    title: {
      template: '%s | AutoAlpha',
      default: seo?.title || defaultTitle,
    },
    description: seo?.description || defaultDesc,
    keywords: seo?.keywords || undefined,
    openGraph: {
      type: 'website',
      title: seo?.title || defaultTitle,
      description: seo?.description || defaultDesc,
      siteName: 'AutoAlpha',
      images: seo?.ogImageUrl ? [{
        url: seo.ogImageUrl,
        width: 1200,
        height: 630,
        alt: seo.title || 'AutoAlpha Trading Terminal',
      }] : [{
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AutoAlpha Trading Terminal',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.title || defaultTitle,
      description: seo?.description || defaultDesc,
      images: seo?.ogImageUrl ? [seo.ogImageUrl] : ['/og-image.jpg'],
    },
    icons: {
      icon: '/icon',
      apple: '/apple-icon',
    },
    manifest: '/manifest.json',
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground min-h-screen relative`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-1000 dark:opacity-100 opacity-50">
           <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-cyan-500/20 dark:bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen" />
           <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>
        <PWASplashScreen />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
        <div className="relative z-10">
          <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <SessionProvider>
            <TrackingProvider>
              <TooltipProvider>
                  {children}
              </TooltipProvider>
            </TrackingProvider>
          </SessionProvider>
        </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
