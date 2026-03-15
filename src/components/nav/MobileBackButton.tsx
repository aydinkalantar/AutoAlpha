'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MobileBackButton() {
    const router = useRouter();

    return (
        <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="md:hidden flex items-center gap-1.5 pl-0 pr-4 py-2 hover:bg-transparent text-foreground/80 hover:text-foreground mb-2 -ml-2 active:opacity-70 transition-all justify-start"
            aria-label="Go Back"
        >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-base font-bold tracking-tight">Back</span>
        </Button>
    );
}
