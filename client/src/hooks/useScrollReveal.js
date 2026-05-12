import { useEffect } from 'react';

/**
 * Shared scroll-reveal hook.
 * Observes elements with .reveal, .reveal-left, .reveal-right, .reveal-scale
 * and adds the .revealed class when they enter the viewport.
 */
const useScrollReveal = () => {
    useEffect(() => {
        const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );
        els.forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);
};

export default useScrollReveal;
