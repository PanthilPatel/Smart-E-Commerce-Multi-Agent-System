import { useCallback, useRef } from 'react';

/**
 * 120fps physics-based 3D perspective tilt and cursor specular tracking.
 * Manipulates GPU transforms and CSS custom variables with zero render overhead.
 */
export function use3DTilt(maxTilt = 5) {
    const isTiltingRef = useRef(false);

    const onMouseMove = useCallback((e) => {
        const card = e.currentTarget;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update specular glare coordinates
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        if (!isTiltingRef.current) {
            card.classList.add('is-tilting');
            isTiltingRef.current = true;
        }

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale3d(1.01, 1.01, 1.01)`;
    }, [maxTilt]);

    const onMouseLeave = useCallback((e) => {
        const card = e.currentTarget;
        if (!card) return;

        card.classList.remove('is-tilting');
        isTiltingRef.current = false;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
    }, []);

    return { onMouseMove, onMouseLeave };
}

/**
 * Tactile magnetic micro-interaction hook for buttons and key interactive CTAs.
 */
export function useMagneticButton(strength = 0.28) {
    const onMouseMove = useCallback((e) => {
        const btn = e.currentTarget;
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        btn.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0) scale(1.02)`;
    }, [strength]);

    const onMouseLeave = useCallback((e) => {
        const btn = e.currentTarget;
        if (!btn) return;
        btn.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
    }, []);

    return { onMouseMove, onMouseLeave };
}
