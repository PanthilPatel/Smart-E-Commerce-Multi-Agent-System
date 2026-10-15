import React, { useState } from 'react';
import { Check, X, Shield, Zap, Lock, PlusCircle, Sparkles, Calendar } from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/config';

const TOPUP_OPTIONS = [
    {
        id: 'booster_100',
        name: 'Mini Booster',
        credits: 100,
        amount: 100,
        tag: 'Popular',
        desc: 'Great for quick product searches'
    },
    {
        id: 'booster_250',
        name: 'Pro Booster',
        credits: 250,
        amount: 200,
        tag: 'Best Value',
        desc: 'Deep multi-agent comparison runs'
    },
    {
        id: 'booster_500',
        name: 'Ultra Booster',
        credits: 500,
        amount: 300,
        tag: 'Maximum Power',
        desc: 'Extensive product research & reviews'
    }
];

export default function SubscriptionModal({ isOpen, onClose, userSession, initialTab = null }) {
    const isPro = userSession?.tier?.toLowerCase() === 'pro';
    const [activeTab, setActiveTab] = useState(initialTab || (isPro ? 'topup' : 'monthly'));
    const [selectedPack, setSelectedPack] = useState('booster_100');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab || (isPro ? 'topup' : 'monthly'));
        }
    }, [isOpen, initialTab, isPro]);

    if (!isOpen) return null;

    const handleCheckout = async (planType, packId = null) => {
        if (!userSession?.id || userSession?.id === 'guest') {
            alert('Please sign in to continue.');
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) throw new Error('Please sign in to continue.');
            const payload = { plan_type: planType };
            if (planType === 'topup') {
                payload.pack_id = packId || selectedPack;
            }

            const { data: orderData } = await axios.post(`${API_BASE_URL}/api/create-order`, payload, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            window.location.href = orderData.short_url;
        } catch (err) {
            console.error('Invoice creation failed', err);
            alert('Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };

    const formatRenewalDate = () => {
        if (userSession?.renewAt) {
            const d = new Date(userSession.renewAt);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        }
        // Fallback for active pro members when renewAt timestamp is not explicitly stored
        const fallback = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return `${fallback.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (Auto-Renews)`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#121215] border border-white/[0.1] rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] p-7 text-white text-left animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Segmented Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/[0.08] rounded-xl mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab('monthly')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'monthly'
                                ? 'bg-gradient-to-b from-[#F5E6B3] via-[#E5C878] to-[#C9A449] text-[#09090B] shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Pro Monthly Plan
                    </button>
                    <button
                        onClick={() => setActiveTab('topup')}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'topup'
                                ? 'bg-gradient-to-b from-[#F5E6B3] via-[#E5C878] to-[#C9A449] text-[#09090B] shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'topup' ? 'text-[#09090B]' : 'text-[#E5C878]'}`} />
                        Token Top-Ups
                    </button>
                </div>

                {activeTab === 'monthly' ? (
                    <div>
                        <div className="mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#E5C878]/15 border border-[#E5C878]/35 flex items-center justify-center mb-4 text-[#F3E5AB] shadow-[0_0_20px_rgba(229,200,120,0.15)]">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight font-display">Pro Monthly Subscription</h2>
                            <p className="text-zinc-400 text-sm mt-1">Unlock massive monthly search quotas and full multi-agent features.</p>
                        </div>

                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-6">
                            <div className="flex items-baseline gap-1.5 mb-4">
                                <span className="text-3xl font-black text-white font-display">₹100</span>
                                <span className="text-zinc-400 text-sm font-medium">/ Month</span>
                            </div>

                            <ul className="space-y-3">
                                {[
                                    '500 Search Credits refreshed every month',
                                    'Access to On-Demand Token Top-Ups',
                                    'Premium Multi-Agent Reasoning',
                                    'Priority Storefront Scraping & Verified Deals',
                                    'No daily query throttling'
                               ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-200">
                                        <Shield className="w-4 h-4 text-[#34D399] shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {isPro && (
                                <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                                    <span className="text-zinc-400 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#E5C878]" />
                                        <span>Next Renewal Date</span>
                                    </span>
                                    <span className="text-[#F3E5AB] font-semibold">
                                        {formatRenewalDate()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {isPro ? (
                            <div className="w-full py-3.5 rounded-xl font-semibold text-sm bg-[#E5C878]/10 border border-[#E5C878]/30 text-[#F3E5AB] flex items-center justify-center gap-2 cursor-default">
                                <span>✓ Pro Membership Active</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleCheckout('pro_monthly')}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-b from-[#F5E6B3] via-[#E5C878] to-[#C9A449] text-[#09090B] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_-4px_rgba(212,175,55,0.35)]"
                            >
                                {loading ? 'Initializing Secure Checkout...' : 'Subscribe Now (Monthly)'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#E5C878]/15 border border-[#E5C878]/35 flex items-center justify-center mb-4 text-[#F3E5AB] shadow-[0_0_20px_rgba(229,200,120,0.15)]">
                                <PlusCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight font-display">Token Top-Up Booster Packs</h2>
                            <p className="text-zinc-400 text-sm mt-1">
                                {isPro
                                    ? 'Out of monthly credits? Instantly boost your balance anytime.'
                                    : 'Need extra search power? Top up your credits instantly.'}
                            </p>
                        </div>

                        <div className="grid gap-3 mb-6">
                            {TOPUP_OPTIONS.map((pack) => {
                                const isSelected = selectedPack === pack.id;
                                return (
                                    <div
                                        key={pack.id}
                                        onClick={() => setSelectedPack(pack.id)}
                                        className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-[#E5C878]/[0.07] border-[#E5C878]/50 ring-1 ring-[#E5C878]/30 shadow-[0_0_20px_rgba(229,200,120,0.1)]'
                                                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                                    isSelected
                                                        ? 'border-[#E5C878] bg-[#E5C878] text-[#09090B]'
                                                        : 'border-zinc-600'
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-white">{pack.name}</span>
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E5C878]/15 text-[#F3E5AB] font-semibold border border-[#E5C878]/30">
                                                        +{pack.credits} Credits
                                                    </span>
                                                </div>
                                                <div className="text-xs text-zinc-400 mt-0.5">{pack.desc}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-white font-display">₹{pack.amount}</div>
                                            <div className="text-[10px] text-zinc-500 font-mono">Instant Credit</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handleCheckout('topup', selectedPack)}
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-b from-[#F5E6B3] via-[#E5C878] to-[#C9A449] text-[#09090B] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_-4px_rgba(212,175,55,0.35)]"
                        >
                            {loading ? 'Initializing Secure Checkout...' : 'Purchase Booster Pack'}
                        </button>
                    </div>
                )}

                <div className="mt-5 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1 font-mono">
                    <Lock className="w-3 h-3 text-zinc-400" /> Secure payment powered by Razorpay
                </div>
            </div>
        </div>
    );
}
