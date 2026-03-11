import { Metadata } from 'next';
import LiveExecutionsClient from './LiveExecutionsClient';

export const metadata: Metadata = {
    title: 'Live Executions | Admin',
};

export default function AdminExecutionsPage() {
    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto">
            <LiveExecutionsClient />
        </div>
    );
}
