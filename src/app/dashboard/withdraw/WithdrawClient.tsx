"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { processCryptoWithdrawal, requestFiatRefund } from '../withdrawActions';

interface WithdrawClientProps {
    userId: string;
    balances: { usdtBalance: number; usdcBalance: number };
}

export default function WithdrawClient({ userId, balances }: WithdrawClientProps) {
    const [mode, setMode] = useState<'CRYPTO' | 'FIAT'>('CRYPTO');
    const [currency, setCurrency] = useState<'USDT' | 'USDC'>('USDT');
    const [network, setNetwork] = useState<'ethereum' | 'arbitrum' | 'optimism' | 'base' | 'polygon'>('ethereum');
    const [amountStr, setAmountStr] = useState('');
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentBalance = currency === 'USDT' ? balances.usdtBalance : balances.usdcBalance;

    const handleCryptoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            formData.append('currency', currency);
            await processCryptoWithdrawal(formData);
            
            alert('Crypto Withdrawal Queued successfully!');
            setAmountStr('');
            setAddress('');
        } catch (err: any) {
            alert(err.message || 'Crypto withdrawal failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFiatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await requestFiatRefund();
            alert(`Fiat refund for $${amountStr} successfully requested!`);
            setAmountStr('');
        } catch (err: any) {
            alert(err.message || 'Failed to request fiat refund.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Withdraw Capital</h1>
                <p className="text-foreground/60 text-lg">Transfer funds from your AutoAlpha portfolio to your external wallet or bank.</p>
            </div>

            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 -mt-12 -mr-12 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 dark:from-emerald-400/5 dark:to-teal-600/5 blur-3xl rounded-full w-64 h-64 pointer-events-none" />

                <div className="bg-black/5 dark:bg-white/5 p-1.5 rounded-[1.25rem] flex border border-black/5 dark:border-white/10 relative z-10">
                    <button
                        onClick={() => setMode('CRYPTO')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'CRYPTO'
                            ? 'bg-gradient-to-br from-cyan-400 to-purple-600 text-white shadow-md'
                            : 'text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                    >
                        Web3 Crypto
                    </button>
                    <button
                        onClick={() => setMode('FIAT')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'FIAT'
                            ? 'bg-gradient-to-br from-cyan-400 to-purple-600 text-white shadow-md'
                            : 'text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                    >
                        Fiat Refund
                    </button>
                </div>

                {mode === 'CRYPTO' ? (
                    <form onSubmit={handleCryptoSubmit} className="space-y-8 relative z-10">
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-foreground/60 px-2 uppercase tracking-wider">Currency</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrency('USDT')}
                                    className={`py-5 px-4 rounded-[1.5rem] border text-base font-semibold transition-all shadow-sm ${currency === 'USDT'
                                        ? "bg-gradient-to-br from-cyan-400 to-purple-600 border-transparent text-white"
                                        : "bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground/60 hover:bg-black/5 dark:hover:bg-white/5"
                                        }`}
                                >
                                    USDT
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrency('USDC')}
                                    className={`py-5 px-4 rounded-[1.5rem] border text-base font-semibold transition-all shadow-sm ${currency === 'USDC'
                                        ? "bg-gradient-to-br from-cyan-400 to-purple-600 border-transparent text-white"
                                        : "bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground/60 hover:bg-black/5 dark:hover:bg-white/5"
                                        }`}
                                >
                                    USDC
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between text-base px-2 font-medium bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                            <span className="text-foreground/60">Available {currency} Balance:</span>
                            <span className="font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-purple-600">${currentBalance.toFixed(2)}</span>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground/80">Select Blockchain Network</label>
                            <select 
                                value={network}
                                title="Select Blockchain Network"
                                aria-label="Select Blockchain Network"
                                onChange={(e) => setNetwork(e.target.value as any)}
                                className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner cursor-pointer"
                            >
                                <option value="ethereum">Ethereum (ERC-20)</option>
                                <option value="arbitrum">Arbitrum One</option>
                                <option value="optimism">Optimism (OP Mainnet)</option>
                                <option value="base">Base</option>
                                <option value="polygon">Polygon (MATIC)</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground/80">Amount to Withdraw</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-6 text-3xl font-bold text-foreground/40">
                                    $
                                </span>
                                <input
                                    type="number"
                                    name="amount"
                                    value={amountStr}
                                    onChange={(e) => setAmountStr(e.target.value)}
                                    required
                                    min="10"
                                    step="0.01"
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1.5rem] pl-14 pr-6 py-6 text-4xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground/80">Destination Address (ERC-20)</label>
                            <input
                                type="text"
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-5 text-base text-foreground placeholder:text-foreground/40 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                                placeholder="0x..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || parseFloat(amountStr) > currentBalance || !amountStr || !address}
                            className="w-full py-5 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-xl shadow-purple-500/20 text-white font-bold text-lg hover:opacity-90 flex items-center justify-center transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : 'Queue Withdrawal'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleFiatSubmit} className="space-y-8 relative z-10">
                        <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 text-center">
                            <p className="text-base text-foreground/60 font-medium leading-relaxed">
                                Fiat refunds process available balances back to the original payment method used for deposit.
                            </p>
                        </div>

                        <div className="flex justify-between text-base px-2 font-medium bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                            <span className="text-foreground/60">Available USDT Balance:</span>
                            <span className="font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-purple-600">${balances.usdtBalance.toFixed(2)}</span>
                        </div>

                        <div className="space-y-3 mt-6">
                            <label className="text-sm font-medium text-foreground/80">Amount to Refund</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-6 text-3xl font-bold text-foreground/40">
                                    $
                                </span>
                                <input
                                    type="number"
                                    name="fiatAmount"
                                    value={amountStr}
                                    onChange={(e) => setAmountStr(e.target.value)}
                                    required
                                    min="10"
                                    step="0.01"
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1.5rem] pl-14 pr-6 py-6 text-4xl font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || parseFloat(amountStr) > balances.usdtBalance || !amountStr}
                            className="w-full py-5 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-xl shadow-purple-500/20 text-white font-bold text-lg hover:opacity-90 flex items-center justify-center transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? 'Requesting...' : 'Request Fiat Refund'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
