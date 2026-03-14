'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Ticket, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { redeemPromoCode } from './promoActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PromoRedemptionForm() {
  const { data: session } = useSession();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    const userId = (session?.user as any)?.id;
    if (!userId) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    setIsLoading(true);
    const result = await redeemPromoCode(code, userId);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      setCode('');
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-black/5 dark:border-white/10 rounded-[2rem] shadow-xl mt-8">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-xl">
            <Ticket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl">Have a Promo Code?</CardTitle>
            <CardDescription className="text-foreground/60">
              Redeem promotional codes for instantly credited trading gas.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Code (e.g. PODCAST20)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={isLoading}
            className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-base font-bold text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner uppercase tracking-wider transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="py-4 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validating
              </>
            ) : (
              'Redeem'
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
