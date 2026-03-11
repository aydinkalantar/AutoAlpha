"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Activity } from 'lucide-react';

interface Toast {
    id: string;
    title: string;
    description: string;
    type: "ENTRY" | "EXIT";
    symbol: string;
    side: string;
}

interface RealtimeContextType {
    isSoundEnabled: boolean;
    toggleSound: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function useRealtime() {
    const context = useContext(RealtimeContext);
    if (!context) throw new Error("useRealtime must be used within RealtimeProvider");
    return context;
}

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const renderedToastsRef = useRef<Set<string>>(new Set());
    const prevPositionsRef = useRef<any[] | null>(null);
    
    // Audio Context (lazy initialized on first user interaction or first play)
    const playSound = (type: "ENTRY" | "EXIT") => {
        if (!isSoundEnabled) return;

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            if (type === "ENTRY") {
                // High-pitch dual chord for entry
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Slide up to A6
                gainNode.gain.setValueAtTime(0, ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            } else {
                // Descending slide for exit
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, ctx.currentTime); 
                osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3); 
                gainNode.gain.setValueAtTime(0, ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
            }
        } catch (e) {
            console.error("Audio playback blocked or failed", e);
        }
    };

    const addToast = (toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);
        playSound(toast.type);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                // Fetch all active positions without paper strictness so we get all algorithmic activity
                const res = await fetch('/api/user/positions/active');
                if (!res.ok) return;
                const data = await res.json();
                
                if (data.success && data.positions) {
                    const currentPositions = data.positions;
                    const prevPositions = prevPositionsRef.current;
                    
                    // If this is the initial load, just seed the ref and return! We don't want 10 toasts on reload.
                    if (prevPositions === null) {
                        prevPositionsRef.current = currentPositions;
                        return;
                    }

                    // 1. Detect New Entries (In current, but not in prev)
                    currentPositions.forEach((curr: any) => {
                        if (!prevPositions.find(p => p.id === curr.id)) {
                            // This position just opened!
                            // Only toast if we haven't already for this exact pos somehow
                            if (!renderedToastsRef.current.has(`entry-${curr.id}`)) {
                                renderedToastsRef.current.add(`entry-${curr.id}`);
                                addToast({
                                    title: "Algorithmic Entry",
                                    description: `Engine initiated dynamic $${curr.entryPrice.toFixed(2)} position.`,
                                    type: "ENTRY",
                                    symbol: curr.symbol,
                                    side: curr.side
                                });
                            }
                        }
                    });

                    // 2. Detect Exits (In prev, but not in current)
                    prevPositions.forEach((prev: any) => {
                        if (!currentPositions.find((c: any) => c.id === prev.id)) {
                            // This position just closed!
                            if (!renderedToastsRef.current.has(`exit-${prev.id}`)) {
                                renderedToastsRef.current.add(`exit-${prev.id}`);
                                addToast({
                                    title: "Algorithmic Exit",
                                    description: `Engine closed ${prev.symbol} position.`,
                                    type: "EXIT",
                                    symbol: prev.symbol,
                                    side: prev.side
                                });
                            }
                        }
                    });

                    prevPositionsRef.current = currentPositions;
                }
            } catch (error) {
                console.error("RealtimeProvider Polling Error:", error);
            }
        };

        // Poll every 5 seconds
        const interval = setInterval(fetchPositions, 5000);
        return () => clearInterval(interval);
    }, []);

    // Load sound preference from LocalStorage
    useEffect(() => {
        const stored = localStorage.getItem('autoalpha_sound');
        if (stored !== null) {
            setIsSoundEnabled(stored === 'true');
        }
    }, []);

    const toggleSound = () => {
        setIsSoundEnabled(prev => {
            const next = !prev;
            localStorage.setItem('autoalpha_sound', String(next));
            return next;
        });
    };

    return (
        <RealtimeContext.Provider value={{ isSoundEnabled, toggleSound }}>
            {children}
            
            {/* Native Tailwind Floating Toasts Container */}
            <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="bg-white/80 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl p-4 w-[320px] pointer-events-auto relative overflow-hidden flex items-start gap-4"
                        >
                            {/* Inner Glow depending on type */}
                            <div className={`absolute top-0 left-0 w-2 h-full ${toast.type === "ENTRY" ? "bg-cyan-500" : "bg-orange-500"}`} />
                            <div className={`absolute -top-10 -left-10 w-24 h-24 blur-3xl rounded-full opacity-20 pointer-events-none ${toast.type === "ENTRY" ? "bg-cyan-500" : "bg-orange-500"}`} />

                            <div className="flex-shrink-0 mt-0.5">
                                {toast.type === "ENTRY" ? (
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <X className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
                                    {toast.title}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${toast.side === 'LONG' || toast.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                        {toast.symbol} {toast.side}
                                    </span>
                                </h4>
                                <p className="text-[13px] text-foreground/70 mt-1 leading-relaxed">{toast.description}</p>
                            </div>

                            <button aria-label="Dismiss Alert" onClick={() => removeToast(toast.id)} className="text-foreground/40 hover:text-foreground transition-colors absolute top-2 right-2 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </RealtimeContext.Provider>
    );
}
