import { Metadata } from 'next';
import LiveExecutionsClient from './LiveExecutionsClient';

export const metadata: Metadata = {
    title: 'Live Executions | Admin',
};

export default function AdminExecutionsPage() {
    return (
        <div className="p-8 pt-20 md:p-12 md:pt-20 max-w-7xl mx-auto">
            <LiveExecutionsClient />
        </div>
    );
}
