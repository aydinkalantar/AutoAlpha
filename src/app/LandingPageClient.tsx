"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { Accordion } from '@/components/ui/Accordion';
import { PlayCircle, Key, Wallet, LineChart, Shield, Lock, ShieldAlert } from 'lucide-react';

export default function LandingPageClient({ initialStrategies }: { initialStrategies: any[] }) {
  const { data: session, status } = useSession();
  const fadeUpVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const faqItems = [
    {
      question: "Can AutoAlpha steal my crypto?",
      answer: "No. You provide us with \"Trade-Only\" API keys. Binance/Bybit physically blocks us from withdrawing your funds."
    },
    {
      question: "What if my Gas Tank runs out?",
      answer: "Our engine will simply pause executing new trades on your account until you top up your USDT/USDC balance. You will receive an email warning before this happens."
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

      {/* 1. The Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/50 dark:bg-black/20 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 transition-colors duration-300">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <div className="w-3 h-3 bg-white rounded-sm transform rotate-45" />
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
            <ThemeToggle />
            {status === "loading" ? (
              <div className="w-24 h-10 animate-pulse bg-black/5 dark:bg-white/10 rounded-full" />
            ) : session ? (
              <Link
                href={(session.user as any)?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/api/auth/signin" className="hidden sm:block text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                  Log In
                </Link>
                <Link href="/api/auth/signin" className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25">
                  Create Free Account
                </Link>
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
              Hedge fund power.<br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Total custody.
              </span>
            </motion.h1>

            <motion.p variants={fadeUpVariants} className="text-lg md:text-2xl text-foreground/60 max-w-3xl font-medium leading-relaxed mb-12">
              Connect your exchange. Select an algorithm. We trade 24/7.<br className="hidden md:block" /> Your funds never leave your wallet.
            </motion.p>

            <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <Link href="#strategies" className="w-full sm:w-auto px-8 py-4 bg-foreground text-background rounded-full text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20 dark:shadow-white/10">
                View Active Strategies
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-3 rounded-full text-lg font-bold text-foreground bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 transition-all">
                <PlayCircle className="w-5 h-5 text-purple-500" />
                How It Works
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* 3. Supported Exchanges Marquee */}
        <section className="w-full py-12 border-y border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10" />
          <div className="w-full flex justify-center overflow-hidden">
            <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-foreground/40 mb-8 whitespace-nowrap px-4">Natively Integrated With Your Preferred Exchange</p>
          </div>
          <div className="flex w-[200%] animate-[marquee_20s_linear_infinite]">
            <div className="flex w-1/2 justify-around items-center opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
              {exchanges.map((ex, i) => (
                <span key={i} className="text-2xl md:text-4xl font-black tracking-tight">{ex}</span>
              ))}
            </div>
            <div className="flex w-1/2 justify-around items-center opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
              {exchanges.map((ex, i) => (
                <span key={`dup-${i}`} className="text-2xl md:text-4xl font-black tracking-tight">{ex}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Evolution of Investing */}
        <section className="w-full max-w-7xl mx-auto px-6 py-32 z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Passive Investing is Flawed.<br />The Market Goes Both Ways.</h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">Holding crypto forces you to bleed during bear markets. AutoAlpha algorithms are designed for total market capitalization—engineering shallower drawdowns and shorting the market when it crashes.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 relative items-stretch">
            {/* V.S. Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex w-16 h-16 rounded-full bg-background border border-black/5 dark:border-white/10/10 items-center justify-center shadow-2xl font-black text-xl italic text-foreground/40 backdrop-blur-md">VS</div>

            <GlassCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent flex flex-col">
              <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                <span className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                The Old Way
              </h3>
              <ul className="space-y-6 flex-1">
                {["Bleeds capital during bear markets.", "Zero automated stop-losses.", "High emotional stress during crashes.", "Only profits when prices go up."].map((text, i) => (
                  <li key={i} className="flex gap-4 text-lg text-foreground/70 items-start">
                    <span className="text-red-500 text-xl leading-none mt-1">🔴</span> <span>{text}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent shadow-[0_0_50px_rgba(16,185,129,0.05)] flex flex-col">
              <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                <span className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                The AutoAlpha Way
              </h3>
              <ul className="space-y-6 flex-1">
                {["Dynamically shorts the market for profit during crashes.", "Strict, mathematical Stop-Losses to protect equity.", "100% automated, hands-free execution.", "Profits from both upward and downward volatility."].map((text, i) => (
                  <li key={i} className="flex gap-4 text-lg font-medium text-foreground/90 items-start">
                    <span className="text-emerald-500 text-xl leading-none mt-1">🟢</span> <span>{text}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </section>

        {/* 5. How It Works */}
        <section id="how-it-works" className="w-full py-32 bg-white/20 dark:bg-white/5 backdrop-blur-3xl border-y border-black/5 dark:border-white/5 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-purple-500/5" />
          <div className="max-w-7xl mx-auto px-6 relative z-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-center mb-20">Set It Up Once.<br />Let the Engine Take Over.</h2>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                { icon: Key, title: "Connect Securely", desc: "Generate read/trade-only API keys on your exchange. We never ask for withdrawal permissions. Your funds stay in your wallet." },
                { icon: Wallet, title: "Fund Your Gas Tank", desc: "Deposit a small prepaid balance (USDT or USDC) to our platform. This covers your future performance fees." },
                { icon: LineChart, title: "Allocate & Automate", desc: "Choose a strategy like GaussBreaker v4.1, tell the system how much of your exchange capital to use, and walk away." }
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

        {/* 6. Strategy Showcase */}
        <section id="strategies" className="w-full max-w-7xl mx-auto px-6 py-32 z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Algorithms Engineered for<br />Every Market Condition.</h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">Select from a curated repository of battle-tested quantitative models.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initialStrategies.length === 0 ? (
              <div className="col-span-full py-12 text-center text-foreground/50 italic">
                No public strategies available at this time.
              </div>
            ) : (
              initialStrategies.map((strategy) => (
                <GlassCard key={strategy.id} className="group hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-[0_10px_40px_rgba(168,85,247,0.15)] flex flex-col justify-between">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-3xl font-black tracking-tight mb-4">{strategy.name}</h3>
                      <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest">
                        <span className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">{strategy.marketType}</span>
                        <span className="px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">{strategy.targetExchange}</span>
                        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">{strategy.settlementCurrency}</span>
                      </div>
                    </div>
                    <p className="text-foreground/70 mb-10 text-lg leading-relaxed">
                      Powered by advanced algorithmic modeling, {strategy.name} aims for {(strategy.expectedRoiPercentage && strategy.expectedRoiPercentage > 0) ? `${strategy.expectedRoiPercentage}% expected ROI` : 'consistent risk-adjusted returns'} via {strategy.targetExchange}.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-end justify-between mb-8 pb-8 border-b border-black/5 dark:border-white/10">
                      <div>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">Fee Model</p>
                        <p className="text-2xl font-black">{strategy.performanceFeePercentage}% <span className="text-lg font-medium text-foreground/50 tracking-normal">Performance</span></p>
                      </div>
                    </div>
                    <Link href="/dashboard" className="block text-center w-full py-4 rounded-xl font-bold bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 group-hover:bg-foreground group-hover:text-background transition-all shadow-sm">
                      Copy Strategy
                    </Link>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </section>

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

        {/* 9. FAQ */}
        <section className="w-full max-w-4xl mx-auto px-6 py-20 z-10">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-16">Frequently Asked Questions</h2>
          <Accordion items={faqItems} />
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-16 border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-2xl mt-20 z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center text-xs font-medium text-foreground/40 leading-relaxed relative z-10">
          <p className="mb-2"><strong className="text-foreground/60">No Financial Advice:</strong> AutoAlpha is a software execution tool, not a registered investment advisor, broker, or fiduciary. We provide automated trading technology. You are solely responsible for all trades executed via your API keys.</p>
          <p><strong className="text-foreground/60">Risk Warning:</strong> Trading cryptocurrency involves extreme risk and potential for total loss of capital. <span className="font-bold text-foreground/70">Past performance is not indicative of future results.</span> Never trade with money you cannot afford to lose.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm transform rotate-45" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground/80">AutoAlpha</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold tracking-widest uppercase text-foreground/40">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/risk" className="hover:text-foreground transition-colors">Risk Disclaimer</Link>
          </div>

          <p className="text-sm font-medium text-foreground/40">© 2026 AutoAlpha. All rights reserved.</p>
        </div>
      </footer>
    </div >
  );
}
