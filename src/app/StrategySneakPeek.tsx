"use client";

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

// Simulated optimal equity curve for visual demonstration
const demoData = [
  { value: 10000 }, { value: 10400 }, { value: 10200 }, { value: 10800 },
  { value: 11500 }, { value: 11200 }, { value: 12100 }, { value: 13000 },
  { value: 12800 }, { value: 13900 }, { value: 14500 }, { value: 14200 },
  { value: 15800 }, { value: 17000 }, { value: 16500 }, { value: 18200 },
  { value: 19500 }, { value: 19000 }, { value: 21000 }, { value: 24250 }
];

export default function StrategySneakPeek({ strategies }: { strategies: any[] }) {
    // Attempt to find GaussBreaker, fallback to the first active strategy, or use a mockup if empty
    const flagship = strategies.find(s => s.name?.toLowerCase().includes('gaussbreaker')) || strategies[0];

    return (
        <section id="strategies" className="w-full py-32 bg-black/5 dark:bg-black/20 border-y border-black/5 dark:border-white/5 relative z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Our Flagship Algorithm.</h2>
                    <p className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                        Precision engineering meets market volatility. View the math behind the machine.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white/70 dark:bg-[#111111]/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-3xl md:text-4xl font-black tracking-tight">{flagship?.name || "GaussBreaker v4.1"}</h3>
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-widest rounded-lg">Flagship</span>
                            </div>
                            <p className="text-foreground/60 font-medium">Fully Automated Perpetual Futures Trading</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">Max Drawdown</p>
                                <p className="text-xl font-black text-rose-500">{flagship?.drawdownPercentage != null ? `-${Math.abs(flagship.drawdownPercentage)}%` : "-12.4%"}</p>
                            </div>
                            <div className="w-px h-10 bg-black/10 dark:bg-white/10 self-center" />
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">Profit Factor</p>
                                <p className="text-xl font-black text-emerald-500">{flagship?.profitFactor != null ? flagship.profitFactor.toFixed(2) : "2.14"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Miniature Equity Curve */}
                    <div className="h-[200px] w-full mb-10 relative">
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <p className="text-7xl font-black tracking-tighter">BACKTEST</p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={demoData}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#10b981" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-black/5 dark:border-white/10 pt-8">
                        <div>
                            <p className="text-sm font-bold text-foreground/60">Target: <span className="text-foreground">{flagship?.targetExchange || "BINANCE"}</span></p>
                            <p className="text-sm font-bold text-foreground/60">Settlement: <span className="text-foreground">{flagship?.settlementCurrency || "USDT"}</span></p>
                        </div>
                        <Link 
                            href={flagship?.id ? `/dashboard/market/${flagship.id}` : "/api/auth/signin"} 
                            className="w-full sm:w-auto px-8 py-4 bg-foreground text-background rounded-xl font-bold hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-white/10 transition-all text-center"
                        >
                            Deep Dive & Backtest Data →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

