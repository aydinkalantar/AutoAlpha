'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWASplashScreen() {
    const [showSplash, setShowSplash] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Ensure this only runs on the client
        if (typeof window !== 'undefined') {
            // Check if the user is launching the PWA (Standalone mode)
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
            
            // We only want the splash screen to play once per session.
            const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

            if (isStandalone && !hasSeenSplash) {
                setShowSplash(true);
                sessionStorage.setItem('hasSeenSplash', 'true');
                
                // Hide splash screen after 2.5 seconds (gives time for cool animation + app routing load)
                setTimeout(() => {
                    setShowSplash(false);
                }, 2500);
            }
        }
    }, []);

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {showSplash && (
                <motion.div
                    key="pwa-splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] bg-[#0A0A0B] flex flex-col items-center justify-center overflow-hidden touch-none"
                >
                    {/* Ambient Animated Background (Global) */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[-10%] left-[-20%] w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] bg-cyan-500/20 blur-[100px] md:blur-[140px] rounded-full animate-ambient-float mix-blend-screen" />
                        <div className="absolute bottom-[-10%] right-[-20%] w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] bg-purple-600/20 blur-[100px] md:blur-[140px] rounded-full animate-ambient-float mix-blend-screen" style={{ animationDelay: '-7.5s' }} />
                    </div>

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ 
                            type: "spring", 
                            damping: 20, 
                            stiffness: 100,
                            delay: 0.1
                        }}
                        className="relative z-10 flex flex-col items-center justify-center"
                    >
                        {/* AutoAlpha Premium Logo Diamond */}
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-purple-600 p-[2px] shadow-2xl shadow-cyan-500/30 mb-8 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            <div className="w-full h-full bg-[#0A0A0B] rounded-[2rem] flex items-center justify-center relative overflow-hidden">
                                {/* Inner glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-[2rem]" />
                                {/* Rotating Diamond */}
                                <motion.div 
                                    animate={{ rotate: [45, 225, 405] }}
                                    transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                                    className="w-8 h-8 bg-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
                                />
                            </div>
                        </div>

                        {/* Title Reveal */}
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-3xl font-black text-white tracking-tight mb-2"
                        >
                            AutoAlpha
                        </motion.h1>
                        
                        {/* Subtitle Reveal */}
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="text-white/50 text-sm tracking-widest font-bold uppercase"
                        >
                            Institutional Alpha
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
