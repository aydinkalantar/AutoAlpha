"use client";

import { motion } from 'framer-motion';

const mockLeaderboard = [
  { rank: 1, user: "User_819", strategy: "GaussBreaker v4.1", return: "+18.4%", color: "text-emerald-500" },
  { rank: 2, user: "User_442", strategy: "GaussBreaker v4.1", return: "+15.2%", color: "text-emerald-500" },
  { rank: 3, user: "User_901", strategy: "TrendSurfer", return: "+12.1%", color: "text-emerald-500" },
  { rank: 4, user: "User_115", strategy: "MeanReversion Pro", return: "+9.8%", color: "text-emerald-500" },
  { rank: 5, user: "User_772", strategy: "GaussBreaker v4.1", return: "+8.5%", color: "text-emerald-500" },
];

export default function PublicLeaderboard() {
  return (
    <section className="w-full py-32 bg-white/50 dark:bg-white/5 backdrop-blur-3xl border-y border-black/5 dark:border-white/5 relative z-10">
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Top Performing Accounts</h2>
          <p className="text-lg text-foreground/60">Live 30-Day Verified ROI (Anonymous)</p>
        </div>

        <div className="bg-white/70 dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-3xl p-2 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-black/5 dark:bg-white/5 rounded-2xl mb-2 text-xs font-bold uppercase tracking-widest text-foreground/40">
            <div>Rank</div>
            <div>User</div>
            <div>Strategy</div>
            <div className="text-right">30D Return</div>
          </div>
          
          <div className="space-y-1 relative">
            {mockLeaderboard.map((row) => (
              <motion.div 
                key={row.rank}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: row.rank * 0.1 }}
                className="grid grid-cols-4 gap-4 px-6 py-5 bg-white/40 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-2xl items-center border border-transparent hover:border-black/5 dark:hover:border-white/10"
              >
                <div className="font-black text-foreground/40 text-lg">#{row.rank}</div>
                <div className="font-bold text-foreground font-mono">{row.user}</div>
                <div className="text-sm font-semibold px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg w-max">{row.strategy}</div>
                <div className={`text-right font-black text-xl tracking-tight ${row.color}`}>{row.return}</div>
              </motion.div>
            ))}
            
            {/* Fade Out Bottom Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-[#111111] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
