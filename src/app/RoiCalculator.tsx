"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function RoiCalculator() {
    const [investment, setInvestment] = useState<number>(10000);
    
    // Top strategy assumed ROI based on Blueprint logic
    const projectedRoiPercentage = 142.5; 
    const projectedProfit = investment * (projectedRoiPercentage / 100);
    const totalValue = investment + projectedProfit;

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvestment(Number(e.target.value));
    };

    return (
        <section className="w-full py-32 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5" />
            <div className="max-w-5xl mx-auto px-6 relative z-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Calculate Your Potential Edge</h2>
                    <p className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                        See what automating your portfolio with our top quantitative model could yield over 12 months.
                    </p>
                </div>

                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Interactive Left Side */}
                        <div className="space-y-12">
                            <div>
                                <div className="flex justify-between items-end mb-6">
                                    <label className="text-sm font-bold uppercase tracking-widest text-foreground/50">Initial Investment</label>
                                    <span className="text-4xl font-black text-foreground">
                                        ${investment.toLocaleString()}
                                    </span>
                                </div>
                                <div className="relative pt-4 pb-8">
                                    <input
                                        type="range"
                                        min="1000"
                                        max="100000"
                                        step="1000"
                                        value={investment}
                                        title="Investment Amount"
                                        aria-label="Investment Amount"
                                        placeholder="Enter amount"
                                        onChange={handleSliderChange}
                                        ref={(el) => {
                                            if (el) {
                                                el.style.background = `linear-gradient(to right, #10b981 0%, #06b6d4 ${(investment - 1000) / (100000 - 1000) * 100}%, rgba(0,0,0,0.1) ${(investment - 1000) / (100000 - 1000) * 100}%)`;
                                            }
                                        }}
                                        className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer relative z-10"
                                    />
                                    <div className="flex justify-between mt-4 text-xs font-bold text-foreground/40">
                                        <span>$1,000</span>
                                        <span>$100,000</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                <p className="text-sm font-semibold text-foreground/70 mb-2">Strategy Selected:</p>
                                <p className="text-xl font-bold text-foreground">GaussBreaker v4.1 (Aggressive)</p>
                                <p className="text-sm font-medium text-emerald-500 mt-1">Expected 12M Return: +142.5%</p>
                            </div>
                        </div>

                        {/* Projection Right Side */}
                        <div className="bg-gradient-to-br from-emerald-400/10 to-cyan-600/10 rounded-3xl p-8 border border-emerald-500/20 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">Projected 12-Month Profit</p>
                            
                            <motion.p 
                                key={projectedProfit}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl md:text-7xl font-black text-emerald-500 tracking-tighter mb-4 shadow-emerald-500/20 drop-shadow-lg"
                            >
                                +${projectedProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </motion.p>
                            
                            <div className="w-full h-px bg-emerald-500/20 my-6" />
                            
                            <p className="text-sm font-bold uppercase tracking-widest text-foreground/50 mb-2">Total Projected Account Value</p>
                            <p className="text-3xl font-black text-foreground">
                                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs font-semibold text-foreground/40 mt-8 max-w-2xl mx-auto">
                    * Projections are based on mathematical backtests of historical tick data from Binance over the last 12 months. Past performance does not guarantee future results.
                </p>
            </div>
        </section>
    );
}
