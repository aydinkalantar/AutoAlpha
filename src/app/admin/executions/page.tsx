import { Metadata } from 'next';
import LiveExecutionsClient from './LiveExecutionsClient';

export const metadata: Metadata = {
    title: 'Live Executions | Admin',
};

export default function AdminExecutionsPage() {
    return (
        <div className="p-4 pt-8 pb-32 md:p-10 md:pt-12 md:pb-32 max-w-7xl mx-auto">
            <LiveExecutionsClient />
        </div>
    );
}
