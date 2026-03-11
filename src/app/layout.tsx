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
      <body className={`${inter.variable} antialiased bg-background text-foreground min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
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
