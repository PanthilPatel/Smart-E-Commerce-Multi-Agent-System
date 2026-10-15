import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, X, Loader2, KeyRound } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                onClose();
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password
                });
                if (error) throw error;
                if (data?.session) {
                    onClose();
                } else {
                    setSuccessMsg('Signup successful! Please check your email to confirm your account.');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in" onClick={onClose} />
            
            <div className="relative z-50 w-full max-w-sm animate-scale-in">
                <div className="bg-[#121215] border border-white/[0.1] p-8 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E5C878]/60 to-transparent" />
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full bg-white/5 border border-white/5 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="mb-6 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-2xl bg-[#E5C878]/15 border border-[#E5C878]/35 flex items-center justify-center shadow-[0_0_20px_rgba(229,200,120,0.15)]">
                            <KeyRound className="w-6 h-6 text-[#F3E5AB]" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-white font-display tracking-tight mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-center text-zinc-400 text-sm mb-6">
                        {isLogin ? 'Sign in to access your wishlists and history.' : 'Join SEAMAS to save your favorite deals.'}
                    </p>

                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-mono">
                            {error}
                        </div>
                    )}
                    
                    {successMsg && (
                        <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-mono">
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E5C878]/60 focus:ring-1 focus:ring-[#E5C878]/40 transition-all font-sans"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E5C878]/60 focus:ring-1 focus:ring-[#E5C878]/40 transition-all font-sans"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 mt-4 bg-gradient-to-b from-[#F5E6B3] via-[#E5C878] to-[#C9A449] text-[#09090B] font-bold rounded-xl text-sm transition-all hover:brightness-110 active:scale-[0.98] shadow-[0_8px_24px_-4px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs text-zinc-400 hover:text-[#F3E5AB] transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
