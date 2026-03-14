import React from 'react';
import { prisma } from '@/lib/prisma';
import PromoCodeForm from './PromoCodeForm';
import PromoCodeTable from './PromoCodeTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PromosPage() {
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage promotional codes for users to redeem Gas Tank credits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create New Promo Code</CardTitle>
              <CardDescription>
                Generate a custom code to reward investors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromoCodeForm />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Promo Codes</CardTitle>
              <CardDescription>
                Track usage and deactivate codes across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromoCodeTable initialCodes={promoCodes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
