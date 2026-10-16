import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, Cpu, Lock, CheckCircle2 } from 'lucide-react';

const STEPS = [
    {
        code: '01 / AUTHENTICATION',
        title: 'Cryptographic Session Verified',
        sub: 'Establishing TLS 1.3 private client tunnel & RLS token...',
        progress: 35,
        icon: ShieldCheck,
    },
    {
        code: '02 / NEURAL MESH',
        title: 'Synchronizing 7-Agent Swarm',
        sub: 'Arming Orchestrator, Live DOM Scraper & Sentiment nodes...',
        progress: 75,
        icon: Cpu,
    },
    {
        code: '03 / CLEARANCE GRANTED',
        title: 'Executive Workspace Ready',
        sub: 'Launching real-time Indian marketplace arbitrage index...',
        progress: 100,
        icon: Sparkles,
    },
];

export default function LoginTransitionOverlay({ userName, onComplete }) {
    const [stepIdx, setStepIdx] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setStepIdx(1), 420);
        const t2 = setTimeout(() => setStepIdx(2), 840);
        const t3 = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 320);
        }, 1250);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    const current = STEPS[stepIdx];
    const CurrentIcon = current.icon;

    return (
        <div
            className={`fixed inset-0 z-[9999] grid place-items-center bg-[#09090B] px-4 transition-opacity duration-300 ${
                isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* Dead-Center Radial Champagne Spotlight */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(circle 560px at 50% 50%, rgba(229, 200, 120, 0.14), rgba(229, 200, 120, 0.03) 45%, transparent 75%)',
                }}
            />

            {/* Subtle Architectural Grid */}
            <div className="seamas-grid pointer-events-none absolute inset-0 opacity-40" />

            {/* Dead-Center Luxury Glass Vault Card */}
            <div className="relative z-10 w-full max-w-md mx-auto rounded-3xl border border-[#E5C878]/25 bg-[#121215]/90 p-8 text-center backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] animate-spring-up">
                {/* Top Gold Specular Line */}
                <div className="absolute inset-x-10 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5C878]/70 to-transparent" />

                {/* Orbital Ring + Central Vault Emblem */}
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                    {/* Rotating Outer Dashed Gold Ring */}
                    <svg className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: '8s' }} viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="rgba(229, 200, 120, 0.35)"
                            strokeWidth="1.5"
                            strokeDasharray="6 6"
                        />
                    </svg>

                    {/* Progress Ring */}
                    <svg className="absolute inset-1.5 h-[88px] w-[88px] -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="#E5C878"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="264"
                            strokeDashoffset={264 - (264 * current.progress) / 100}
                            className="transition-all duration-500 ease-out"
                        />
                    </svg>

                    {/* Inner Glowing Core */}
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E5C878]/40 bg-gradient-to-b from-[#1F1F26] to-[#121215] shadow-[0_0_30px_rgba(229,200,120,0.3)]">
                        <CurrentIcon className="h-6 w-6 text-[#F5E6B3]"/>
                    </div>
                </div>

                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5C878]/30 bg-[#E5C878]/10 px-3 py-1 mb-3">
                    <Lock className="h-3 w-3 text-[#E5C878]"/>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F5E6B3]">
                        {current.code}
                    </span>
                </div>

                {/* Personalized Welcome Headline */}
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                    Welcome, <span className="text-[#F5E6B3]">{userName || 'Client'}</span>
                </h2>

                {/* Active Step Title */}
                <p className="mt-1.5 text-sm font-medium text-zinc-200 transition-all">
                    {current.title}
                </p>

                {/* Smooth Progress Bar */}
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] p-0.5">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C9A449] via-[#E5C878] to-[#F5E6B3] shadow-[0_0_12px_rgba(229,200,120,0.6)] transition-all duration-500 ease-out"
                        style={{ width: `${current.progress}%` }}
                    />
                </div>

                {/* 7-Agent Node Mini-Indicators */}
                <div className="mt-4 flex items-center justify-center gap-2">
                    {['ORCH', 'SRCH', 'PRCE', 'REVW', 'BDGT', 'RECM', 'FINL'].map((node, i) => {
                        const active = stepIdx >= 1 || i <= stepIdx * 3;
                        return (
                            <span
                                key={node}
                                className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold transition-all duration-300 ${
                                    active
                                        ? 'border border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]'
                                        : 'border border-white/5 bg-white/[0.02] text-zinc-600'
                                }`}
                            >
                                {node}
                            </span>
                        );
                    })}
                </div>

                {/* Sub-telemetry */}
                <div className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[11px] text-zinc-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0"/>
                    <span className="truncate">{current.sub}</span>
                </div>
            </div>
        </div>
    );
}
