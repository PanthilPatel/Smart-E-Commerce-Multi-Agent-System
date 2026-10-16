import { useState, useEffect } from 'react';

export function useAnimatedNumber(targetValue, duration = 650) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const target = Number(targetValue);
        if (isNaN(target) || target <= 0) {
            setCurrent(targetValue);
            return;
        }
        let startTime = null;
        let animId = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // easeOutExpo curve: 1 - Math.pow(2, -10 * progress)
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCurrent(Math.round(ease * target));

            if (progress < 1) {
                animId = requestAnimationFrame(step);
            }
        };

        animId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animId);
    }, [targetValue, duration]);

    return current;
}
