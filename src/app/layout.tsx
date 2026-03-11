import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "@/components/SessionProvider";

export const dynamic = 'force-dynamic';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://autoalpha.ai'),
  title: {
    template: '%s | AutoAlpha',
    default: 'AutoAlpha | Institutional Crypto Copy-Trading',
  },
  description: "Automated crypto trading, Binance API bot, algorithmic copy-trading, non-custodial.",
  openGraph: {
    type: 'website',
    title: 'AutoAlpha | Institutional Crypto Copy-Trading',
    description: "Automated crypto trading, Binance API bot, algorithmic copy-trading, non-custodial.",
    siteName: 'AutoAlpha',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'AutoAlpha Trading Terminal',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoAlpha | Institutional Crypto Copy-Trading',
    description: "Automated crypto trading, Binance API bot, algorithmic copy-trading, non-custodial.",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground min-h-screen relative`}>
        {/* Global Ambient Glassmorphism Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] transition-opacity duration-1000 dark:opacity-100 opacity-50">
           <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen" />
           <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
