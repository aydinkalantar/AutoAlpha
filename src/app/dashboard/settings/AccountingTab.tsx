import React from 'react';
import AccountingSection from '../AccountingSection';
import AutoDepositSettings from './AutoDepositSettings';

export default function AccountingTab({ user }: { user: any }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AccountingSection
                ledgers={user.ledgers}
                positions={user.positions}
                usdtBalance={user.usdtBalance}
                usdcBalance={user.usdcBalance}
            />

            <AutoDepositSettings 
                autoDepositEnabled={user.autoDepositEnabled}
                autoDepositThreshold={user.autoDepositThreshold}
                autoDepositAmount={user.autoDepositAmount}
                hasStripeCustomer={!!user.stripeCustomerId}
            />
        </div>
    );
}
