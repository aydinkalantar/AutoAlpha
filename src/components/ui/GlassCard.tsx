import { cn } from "@/components/admin/AdminSidebar";

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("relative overflow-hidden rounded-[2rem] bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 shadow-xl transition-all duration-300", className)}>
            {/* Subtle inner top highlight for glass effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
            <div className="relative z-10 p-8 md:p-10">
                {children}
            </div>
        </div>
    );
}
