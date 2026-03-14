"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Tracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref) {
            // Set cookie for 30 days
            const d = new Date();
            d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
            // Setting path=/ so it is available globally
            document.cookie = `autoalpha_ref=${ref};expires=${d.toUTCString()};path=/;secure;samesite=lax`;
        }
    }, [searchParams]);

    return null;
}

export function TrackingProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={null}>
                <Tracker />
            </Suspense>
            {children}
        </>
    );
}
