'use client';

import React, { useState } from 'react';
import { createPromoCode } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PromoCodeForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createPromoCode(formData);
    
    setIsLoading(false);
    
    if (result.success) {
      toast.success(result.message);
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Promo Code</Label>
        <Input 
          id="code" 
          name="code" 
          placeholder="e.g. LAUNCH50" 
          required 
          className="uppercase"
        />
        <p className="text-xs text-muted-foreground">Will be forced to uppercase.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="creditAmount">Credit Amount ($)</Label>
        <Input 
          id="creditAmount" 
          name="creditAmount" 
          type="number" 
          step="0.01" 
          min="1" 
          placeholder="50.00" 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxUses">Max Uses (Optional)</Label>
        <Input 
          id="maxUses" 
          name="maxUses" 
          type="number" 
          min="1" 
          placeholder="e.g. 100" 
        />
        <p className="text-xs text-muted-foreground">Leave blank for unlimited.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
        <Input 
          id="expiresAt" 
          name="expiresAt" 
          type="datetime-local" 
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Promo Code'}
      </Button>
    </form>
  );
}
