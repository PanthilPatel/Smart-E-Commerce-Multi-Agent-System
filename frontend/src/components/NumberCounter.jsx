import React, { useState, useEffect, useRef } from 'react';

/**
 * High-performance 120fps physics-based number counter using requestAnimationFrame
 * and exponential deceleration curve.
 */
export default function NumberCounter({
    value = 0,
    duration = 1000,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = ''
}) {
    // Parse target number
    const target = typeof value === 'number' 
        ? value 
        : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;

    const [displayValue, setDisplayValue] = useState(target);
    const startValueRef = useRef(0);
    const startTimeRef = useRef(null);
    const animFrameRef = useRef(null);

    useEffect(() => {
        startValueRef.current = displayValue;
        startTimeRef.current = null;

        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Quintic / Exponential ease-out for tactile, ultra-smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const current = startValueRef.current + (target - startValueRef.current) * easeOut;

            setDisplayValue(current);

            if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(target);
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [target, duration]);

    const formatted = decimals > 0 
        ? displayValue.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.round(displayValue).toLocaleString('en-IN');

    return (
        <span className={`tabular-nums ${className}`}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
