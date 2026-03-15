import React from 'react';
import ApiKeyForm from '../ApiKeyForm';

export default function ApiKeysTab({ user }: { user: any }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ApiKeyForm 
                userId={user.id} 
                existingKeys={user.exchangeKeys} 
                isTestnetMode={user.isTestnetMode}
            />
        </div>
    );
}
