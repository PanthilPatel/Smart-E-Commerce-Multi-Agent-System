import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, Cpu } from 'lucide-react';

const STEPS = [
    { text: "Verifying encrypted credentials & session tokens...", icon: ShieldCheck },
    { text: "Connecting to SEAMAS 7-Agent Neural Mesh...", icon: Cpu },
    { text: "Access granted. Launching private client workspace...", icon: Sparkles }
];

export default function LoginTransitionOverlay({ userName, onComplete }) {
    const [stepIdx, setStepIdx] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Step progression over 1.2 seconds total
        const t1 = setTimeout(() => setStepIdx(1), 380);
        const t2 = setTimeout(() => setStepIdx(2), 760);
        const t3 = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 300);
        }, 1100);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    const CurrentIcon = STEPS[stepIdx].icon;

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[#09090B] transition-opacity duration-300 ${
                isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* Ambient Radial Spotlight */}
            <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle 500px at 50% 50%, rgba(229, 200, 120, 0.12), transparent 70%)'
                }}
            />

            {/* Central Animated Capsule */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6 animate-scale-in">
                {/* Glowing Monogram Orb */}
                <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1E1E24] to-[#121215] border border-[#E5C878]/40 flex items-center justify-center shadow-[0_0_35px_rgba(229,200,120,0.3)]">
                        <CurrentIcon className="w-7 h-7 text-[#F5E6B3] animate-pulse"/>
                    </div>
                    {/* Concentric Ping Ripple */}
                    <span className="absolute inset-0 rounded-2xl border border-[#E5C878]/60 animate-ping opacity-40 pointer-events-none" />
                </div>

                {/* Status Telemetry */}
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E5C878] mb-1.5">
                    Security Handshake
                </span>
                <h3 className="font-display text-lg font-medium text-white mb-3">
                    Welcome, {userName || 'Client'}
                </h3>

                {/* Progress Pipeline Dots */}
                <div className="flex items-center gap-1.5 mb-4">
                    {STEPS.map((_, i) => (
                        <div 
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === stepIdx 
                                    ? 'w-8 bg-gradient-to-r from-[#E5C878] to-[#C9A449]' 
                                    : i < stepIdx 
                                    ? 'w-2 bg-[#34D399]' 
                                    : 'w-2 bg-white/10'
                            }`}
                        />
                    ))}
                </div>

                {/* Animated Status Text */}
                <p className="font-mono text-xs text-neutral-400 min-h-[20px] transition-all">
                    {STEPS[stepIdx].text}
                </p>
            </div>
        </div>
    );
}
