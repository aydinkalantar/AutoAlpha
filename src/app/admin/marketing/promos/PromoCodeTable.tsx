'use client';

import React from 'react';
import { PromoCode } from '@prisma/client';
import { togglePromoCodeStatus } from './actions';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function PromoCodeTable({ initialCodes }: { initialCodes: PromoCode[] }) {
  
  async function handleToggle(id: string, currentStatus: boolean) {
    const result = await togglePromoCodeStatus(id, currentStatus);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  if (initialCodes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No promo codes have been created yet.
      </div>
    );
  }

  return (
    <div className="w-full rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Active toggle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialCodes.map((code) => {
            const isUnlimited = code.maxUses === null;
            const isFull = !isUnlimited && code.currentUses >= (code.maxUses as number);
            const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date();
            
            return (
              <TableRow key={code.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {code.code}
                </TableCell>
                <TableCell>
                  ${code.creditAmount.toFixed(2)}
                </TableCell>
                <TableCell>
                  {code.currentUses} / {isUnlimited ? '∞' : code.maxUses}
                  {isFull && <Badge variant="destructive" className="ml-2">Maxed</Badge>}
                </TableCell>
                <TableCell>
                  {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}
                  {isExpired && <Badge variant="destructive" className="ml-2">Expired</Badge>}
                </TableCell>
                <TableCell>
                  <Badge variant={code.isActive ? "default" : "secondary"}>
                    {code.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Switch 
                    checked={code.isActive} 
                    onCheckedChange={() => handleToggle(code.id, code.isActive)}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
