"use client";

import { useState } from "react";
import { changePassword, deleteAccount } from "./actions";
import { signOut } from "next-auth/react";

export default function SecurityActions({ hasPassword }: { hasPassword: boolean }) {
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            const formData = new FormData(e.currentTarget);
            await changePassword(formData);
            alert("Password successfully changed!");
            setIsChangePasswordOpen(false);
        } catch (err: any) {
            setError(err.message || "Failed to change password");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData(e.currentTarget);
            await deleteAccount(formData);
            alert("Account has been permanently deleted.");
            signOut({ callbackUrl: '/' });
        } catch (err: any) {
            setError(err.message || "Failed to delete account");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    disabled={!hasPassword}
                    className="px-6 py-3 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-foreground font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!hasPassword ? "Account uses external authentication" : "Change Password"}
                >
                    Change Password
                </button>
                <button
                    onClick={() => setIsDeleteAccountOpen(true)}
                    className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold transition-colors border border-red-500/20"
                >
                    Delete Account
                </button>
            </div>

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[2rem] p-8 pb-32 max-w-md w-full max-h-[85dvh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setIsChangePasswordOpen(false)} className="absolute top-6 right-6 text-foreground/40 hover:text-foreground">
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-foreground">Change Password</h2>
                        
                        {error && (
                            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/60">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    title="Current Password"
                                    required
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/60">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    title="New Password"
                                    required
                                    minLength={8}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 mt-4 bg-gradient-to-br from-cyan-400 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {isDeleteAccountOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#0A0A0A] border border-red-500/30 rounded-[2rem] p-8 pb-32 max-w-md w-full max-h-[85dvh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setIsDeleteAccountOpen(false)} className="absolute top-6 right-6 text-foreground/40 hover:text-foreground">
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-500">Delete Account</h2>
                        <p className="text-foreground/70 text-sm mb-6 leading-relaxed">
                            This action is <strong>irreversible</strong>. It will permanently delete your account, API keys, position history, and immediately halt any active bot subscriptions.
                        </p>
                        
                        {error && (
                            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            {hasPassword && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground/60">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        title="Password"
                                        required
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/60">Type <span className="text-red-500 select-all">DELETE</span> to confirm</label>
                                <input
                                    type="text"
                                    name="confirmText"
                                    title="Confirm Deletion"
                                    required
                                    pattern="DELETE"
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    placeholder="DELETE"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 mt-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? 'Deleting...' : 'Permanently Delete Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
