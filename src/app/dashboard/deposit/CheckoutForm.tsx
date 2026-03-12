"use client";

import React, { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface CheckoutFormProps {
    grossAmount: number;
    netDesiredAmount: number;
    clientSecret: string;
}

export default function CheckoutForm({ grossAmount, netDesiredAmount, clientSecret }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        // We use confirmSetup instead of confirmPayment if we are saving the card for off_session via SetupIntents
        // But our backend uses PaymentIntents with setup_future_usage: 'off_session'. 
        // For PaymentIntents we still use confirmPayment:
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Adjust to the landing page you want users to see after Stripe redirects
                // Since AutoAlpha is a SPA Next.js app, we route them back to Accounting Hub to see their new balance
                return_url: `${window.location.origin}/dashboard/accounting`,
            },
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsProcessing(false);
        } else {
            // Success is handled by the redirect return_url
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 shadow-inner">
                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            </div>
            
            {message && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-500 font-medium">{message}</p>
                </div>
            )}

            <button
                disabled={isProcessing || !stripe || !elements}
                id="submit"
                className="w-full py-5 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-xl shadow-purple-500/20 text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
                {isProcessing ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Pay ${grossAmount.toFixed(2)}
                        <ChevronRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </form>
    );
}
