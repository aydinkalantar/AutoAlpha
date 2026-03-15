"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { Accordion } from '@/components/ui/Accordion';
import { PlayCircle, Key, Wallet, LineChart, Shield, Lock, ShieldAlert, Cpu, Download, X, Share } from 'lucide-react';
import RoiCalculator from './RoiCalculator';
import StrategySneakPeek from './StrategySneakPeek';
import PublicLeaderboard from './PublicLeaderboard';
import { useState, useEffect } from 'react';

export default function LandingPageClient({ initialStrategies }: { initialStrategies: any[] }) {
  const { data: session, status } = useSession();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check if already installed
    const _isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(_isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Chrome/Android native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const fadeUpVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const faqItems = [
    {
      question: "Can AutoAlpha withdraw my crypto?",
      answer: "No. You provide us with \"Trade-Only\" API keys. Your exchange physically blocks us from withdrawing your funds. Our architecture is 100% non-custodial."
    },
    {
      question: "How does the Gas Tank work?",
      answer: "Our engine will execute trades on your account 24/7. We only deduct our performance fee from your prepaid Gas Tank balance when a trade closes in profit. If your Gas Tank hits $0, the system safely pauses new entries."
    },
    {
      question: "What exchanges are supported?",
      answer: "We natively integrate with Binance, Bybit, OKX, Kraken, Coinbase, MEXC, and Gate.io."
    },
    {
      question: "Do I need to keep my computer on?",
      answer: "Not at all. AutoAlpha is a 100% cloud-based SaaS. Once you subscribe, our servers handle the 24/7 execution."
    }
  ];

  const exchanges = ["Binance", "Bybit", "OKX", "Kraken", "Coinbase", "MEXC", "Gate.io"];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-500/30 overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 dark:bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 dark:bg-cyan-600/30 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-color-dodge" />
      </div>

      {/* PWA Smart App Banner (Mobile iOS Style) */}
      <AnimatePresence>
        {showBanner && !isStandalone && (deferredPrompt || isIOS) && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 inset-x-0 z-[100] bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-b border-black/10 dark:border-white/10 px-4 py-3 flex items-center gap-3 md:hidden shadow-lg"
          >
            <button 
              onClick={() => setShowBanner(false)} 
              className="p-2 -ml-2 text-foreground/40 hover:text-foreground transition-colors mix-blend-difference"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-11 h-11 rounded-[0.85rem] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-inner shrink-0 border border-black/10 dark:border-white/10">
              <span className="text-white font-bold text-2xl leading-none pb-1">α</span>
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="font-bold text-[15px] text-foreground truncate leading-tight tracking-tight">AutoAlpha Web App</p>
              <p className="text-[13px] text-foreground/60 truncate leading-tight font-medium">Pro performance. Zero effort.</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            <button 
              onClick={handleInstallClick} 
              className="px-5 py-1.5 bg-gradient-to-b from-cyan-500 to-cyan-600 text-white text-[13px] font-bold rounded-full shrink-0 hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              GET
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. The Navigation Bar */}
      <header className={`fixed w-full z-50 bg-white/50 dark:bg-black/20 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 transition-all duration-300 ${showBanner && !isStandalone && (deferredPrompt || isIOS) ? 'top-[70px] md:top-0' : 'top-0'}`}>
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white font-bold text-lg leading-none pb-[2px]">α</span>
            </div>
            <span className="font-bold text-xl tracking-tight">AutoAlpha</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#strategies" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Strategies</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#security" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Security</Link>
            <Link href="#pricing" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <>
                <div className="w-24 h-10 animate-pulse bg-black/5 dark:bg-white/10 rounded-full" />
                <ThemeToggle />
              </>
            ) : session ? (
              <>
                <Link
                  href={(session.user as any)?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
                >
                  Dashboard
                </Link>
                <ThemeToggle />
              </>
            ) : (
              <>
                <Link href="/api/auth/signin" className="hidden sm:block text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                  Log In
                </Link>
                <Link href="/api/auth/signin" className="px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 whitespace-nowrap">
                  <span className="sm:hidden">Sign Up</span>
                  <span className="hidden sm:inline">Create Free Account</span>
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="relative z-10 flex flex-col items-center">
        {/* 2. The Hero Section */}
        <section className="w-full min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center">
          <motion.div
            initial="hidden" animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
            className="flex flex-col items-center max-w-5xl"
          >
            <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md mb-8 shadow-xl">
              <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">Pro performance. Zero effort.</span>
            </motion.div>

            <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/60">
              Institutional-Grade Crypto<br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Algorithms. Zero Custody Risk.
              </span>
            </motion.h1>

            <motion.p variants={fadeUpVariants} className="text-lg md:text-2xl text-foreground/60 max-w-3xl font-medium leading-relaxed mb-12">
              Connect your exchange API. Fund your prepaid Gas Tank. Let emotionless algorithms trade your account 24/7. <strong className="text-foreground">We only get paid when you profit.</strong>
            </motion.p>

            <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Hero CTA Block has been unified, Mobile Install logic is now handled by the Smart Banner at the top of the viewport */}

              <Link href="/api/auth/signin" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-[2rem] text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/30 dark:shadow-purple-500/20 text-center">
                Start Automating
              </Link>
              <Link href="#strategies" className="w-full sm:w-auto px-10 py-5 flex items-center justify-center gap-3 rounded-[2rem] text-xl font-bold text-foreground bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 transition-all">
                <PlayCircle className="w-5 h-5 text-purple-500" />
                View Live Strategies
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* 3. The Trust Strip */}
        <section className="w-full border-y border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-xl relative z-10">
          <div className="py-12 border-b border-black/5 dark:border-white/5 overflow-hidden relative">
            <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="w-full flex justify-center overflow-hidden">
              <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-widest sm:tracking-[0.2em] text-foreground/40 mb-8 px-4 max-w-full">
                Natively Integrated With Your Preferred Exchange
              </p>
            </div>
            <div className="flex w-max">
              <div className="flex w-max animate-[marquee_20s_linear_infinite] items-center">
                <div className="flex items-center gap-12 sm:gap-24 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500 pr-12 sm:pr-24">
                  {exchanges.map((ex, i) => (
                    <span key={i} className="text-2xl md:text-3xl font-black tracking-tight">{ex}</span>
                  ))}
                </div>
              </div>
              <div className="flex w-max animate-[marquee_20s_linear_infinite] items-center" aria-hidden="true">
                <div className="flex items-center gap-12 sm:gap-24 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500 pr-12 sm:pr-24">
                  {exchanges.map((ex, i) => (
                    <span key={`dup-${i}`} className="text-2xl md:text-3xl font-black tracking-tight">{ex}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <Shield className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/50">Billing & Subscription</p>
                <p className="text-sm font-black tracking-tight">Payments secured by Stripe</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-16">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Total Trades Executed</p>
                <p className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">1,204,492+</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-black/10 dark:bg-white/10" />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Global Win Rate</p>
                <p className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">68.4%</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-black/10 dark:bg-white/10" />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Active Platform Uptime</p>
                <p className="text-3xl font-black text-foreground">99.99%</p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Calculator Section */}
        <RoiCalculator />

        {/* 4. The Three Pillars Grid */}
        <section className="w-full max-w-7xl mx-auto px-6 py-32 z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Built Differently.<br />Engineered for Trust.</h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">AutoAlpha solves the three biggest fears in crypto: custodian risk, exorbitant fees, and human emotion.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative items-stretch">
            {/* Pillar 1 */}
            <GlassCard className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent flex flex-col p-8 md:p-10 hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-500/20 flex items-center justify-center mb-8 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-cyan-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">100% Non-Custodial</h3>
              <p className="text-foreground/70 leading-relaxed text-lg">
                Your keys, your crypto. We never hold your funds. Our trade-only API architecture ensures your money stays safely in your own exchange account.
              </p>
            </GlassCard>

            {/* Pillar 2 */}
            <GlassCard className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col p-8 md:p-10 hover:-translate-y-2 transition-all shadow-[0_0_50px_rgba(16,185,129,0.05)] group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/20 flex items-center justify-center mb-8 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <LineChart className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Performance-Aligned</h3>
              <p className="text-foreground/70 leading-relaxed text-lg">
                No hidden management fees. You top up a prepaid Gas Tank, and we only deduct our fee when a trade closes in profit. If we don't win, you don't pay.
              </p>
            </GlassCard>

            {/* Pillar 3 */}
            <GlassCard className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent flex flex-col p-8 md:p-10 hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-purple-500/20 flex items-center justify-center mb-8 border border-purple-500/30 group-hover:scale-110 transition-transform">
                <Cpu className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Emotionless Execution</h3>
              <p className="text-foreground/70 leading-relaxed text-lg">
                Humans panic. Algorithms don't. Our sub-second routing engine executes trades flawlessly while you sleep, removing FOMO and fear from the equation.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* 5. How It Works (3-Step Setup) */}
        <section id="how-it-works" className="w-full py-32 bg-white/20 dark:bg-white/5 backdrop-blur-3xl border-y border-black/5 dark:border-white/5 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-purple-500/5" />
          <div className="max-w-7xl mx-auto px-6 relative z-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-center mb-20">Set It Up Once.<br />Let the Engine Take Over.</h2>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                { icon: Key, title: "Connect", desc: "Generate a Trade-Only API key on your favorite exchange. We have zero withdrawal access." },
                { icon: Wallet, title: "Fuel", desc: "Add $50 of USDC or Fiat to your prepaid Gas Tank via Stripe to cover future performance fees." },
                { icon: LineChart, title: "Deploy", desc: "Select your strategy, enter your desired capital allocation, and activate with one click." }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 to-purple-600/20 flex items-center justify-center mb-8 border border-white/40 dark:border-white/10 group-hover:-translate-y-2 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-500 backdrop-blur-md">
                    <step.icon className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Step {i + 1}:<br />{step.title}</h3>
                  <p className="text-foreground/60 leading-relaxed text-lg">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Strategy Sneak Peek */}
        <StrategySneakPeek strategies={initialStrategies} />

        {/* 7. Trust & Security Armor */}
        <section id="security" className="w-full py-32 bg-gradient-to-b from-transparent to-cyan-900/10 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Military-Grade Security for<br />Your Peace of Mind.</h2>
              <p className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">We designed the AutoAlpha engine so that it physically cannot touch your funds.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: ShieldAlert, title: "Zero Withdrawal Access", desc: "Our system physically cannot withdraw your crypto. The API keys you provide are strictly limited to executing trades." },
                { icon: Lock, title: "AES-256 Encryption", desc: "Your exchange keys are encrypted at rest using banking-standard protocols and are only decrypted in memory during execution." },
                { icon: Shield, title: "Isolated Margin Protection", desc: "Our engine forces your exchange into 'Isolated Margin' mode, ensuring a single trade can never access or liquidate your entire portfolio." }
              ].map((feat, i) => (
                <GlassCard key={i} className="text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 flex items-center justify-center mb-8 shadow-inner border border-white/20 dark:border-white/5">
                    <feat.icon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
                  <p className="text-foreground/60 leading-relaxed text-lg">{feat.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Pricing Model */}
        <section id="pricing" className="w-full max-w-5xl mx-auto px-6 py-32 text-center z-10">
          <GlassCard className="border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-transparent p-12 md:p-20 shadow-[0_0_100px_rgba(6,182,212,0.1)]">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6">We Only Make Money<br />When You Make Money.</h2>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-10">No monthly subscriptions. No hidden management fees.</p>
            <p className="text-xl text-foreground/70 leading-relaxed max-w-3xl mx-auto mb-16">
              We operate on a strict High-Water Mark performance fee model. When our algorithms close a winning trade on your exchange, we calculate our dynamic fee and deduct it from your prepaid AutoAlpha Gas Tank. If a trade loses, you pay absolutely nothing to us.
            </p>
            <Link href="/dashboard" className="inline-block px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full text-2xl font-bold hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all">
              Deposit & Start Copying
            </Link>
          </GlassCard>
        </section>

        {/* 9. Public Leaderboard */}
        <PublicLeaderboard />

        {/* 10. Install the App */}
        <section className="w-full max-w-5xl mx-auto px-6 py-20 z-10 text-center">
          <GlassCard className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 p-8 md:p-12 shadow-[0_0_80px_rgba(168,85,247,0.15)] flex flex-col md:flex-row items-center gap-12 text-left relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            
            <div className="flex-1 relative z-10 w-full">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-sm tracking-wider uppercase mb-6 border border-purple-500/30">
                <Download className="w-4 h-4" /> Available Now
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Install the Web App</h2>
              <p className="text-lg md:text-xl text-foreground/70 leading-relaxed mb-8">
                Get the full native experience. Install AutoAlpha directly to your home screen for instant access, push notifications, and a distraction-free fullscreen trading environment.
              </p>
              <button 
                onClick={handleInstallClick} 
                className="w-full md:w-auto px-8 py-4 bg-foreground text-background rounded-full text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                Download For Free
              </button>
            </div>
            
            <div className="hidden md:flex w-64 h-64 shrink-0 bg-black/5 dark:bg-white/5 rounded-[3rem] items-center justify-center border border-black/5 dark:border-white/10 shadow-inner relative overflow-hidden backdrop-blur-3xl group-hover:rotate-3 transition-transform duration-500">
               <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
               <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl transform rotate-45 border border-white/50 shadow-inner flex items-center justify-center">
                    <span className="text-white font-bold text-2xl leading-none transform -rotate-45 pb-1">α</span>
                 </div>
               </div>
            </div>
          </GlassCard>
        </section>

        {/* 11. FAQ */}
        <section className="w-full max-w-4xl mx-auto px-6 py-20 z-10">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-16">Frequently Asked Questions</h2>
          <Accordion items={faqItems} />
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-2xl mt-20 z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8 relative z-10">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none pb-[2px]">α</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground/80">AutoAlpha</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold tracking-widest uppercase text-foreground/40">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/risk" className="hover:text-foreground transition-colors">Risk Disclaimer</Link>
              <button onClick={handleInstallClick} className="hover:text-cyan-500 transition-colors uppercase font-bold tracking-widest md:hidden">
                Download Web App
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-black/5 dark:bg-white/10" />

          <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 text-[11px] text-foreground/40">
            <div className="max-w-4xl space-y-2 leading-relaxed text-left text-foreground/30">
              <p><strong className="text-foreground/50 font-semibold">No Financial Advice:</strong> AutoAlpha is a software execution tool, not a registered investment advisor, broker, or fiduciary. We provide automated trading technology. You are solely responsible for all trades executed via your API keys.</p>
              <p><strong className="text-foreground/50 font-semibold">Risk Warning:</strong> Trading cryptocurrency involves extreme risk and potential for total loss of capital. <span className="font-semibold text-foreground/40">Past performance is not indicative of future results.</span> Never trade with money you cannot afford to lose.</p>
            </div>
            <div className="shrink-0 text-left lg:text-right font-medium text-foreground/30">
              © 2026 AutoAlpha. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* iOS PWA Install Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8 sm:items-center sm:pb-0 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="p-6 flex items-start justify-between">
              <div className="flex bg-cyan-500/20 dark:bg-cyan-500/20 p-3 rounded-2xl w-fit mb-4 border border-cyan-500/20">
                <Download className="w-8 h-8 text-cyan-500" />
              </div>
              <button onClick={() => setShowIOSModal(false)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-foreground/60 focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 pb-8">
              <h2 className="text-2xl font-black tracking-tight text-foreground mb-3">Install AutoAlpha Web App</h2>
              <p className="text-foreground/70 text-lg leading-relaxed mb-8">
                Install AutoAlpha on your home screen for quick, secure access and a full-screen trading experience.
              </p>

              <div className="flex flex-col gap-5 relative isolate">
                <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-cyan-500/50 to-purple-500/50 -z-10 rounded-full" />
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 font-bold flex items-center justify-center shadow-inner text-sm border-2 border-white dark:border-[#1C1C1E]">1</div>
                  <p className="font-medium text-foreground/80 flex items-center gap-2 text-base">
                    Tap the
                    <Share className="w-5 h-5 text-blue-500 inline-block px-1 bg-gray-100 dark:bg-white/10 rounded" />
                    Share icon
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center shadow-inner text-sm border-2 border-white dark:border-[#1C1C1E]">2</div>
                  <p className="font-medium text-foreground/80 text-base">Select <strong>Add to Home Screen</strong></p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50/80 dark:bg-white/5 border-t border-black/5 dark:border-white/5">
                <button onClick={() => setShowIOSModal(false)} className="w-full py-4 text-center text-sm font-bold text-foreground/50 hover:text-foreground/80 transition-colors uppercase tracking-widest focus:outline-none">Got It</button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
}
