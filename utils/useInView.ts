import { useRef, useState, useEffect } from 'react';

export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback: if IntersectionObserver hasn't triggered in 1.5s, show anyway.
    // This prevents invisible content on mobile Safari where IO can be unreliable.
    const fallbackTimer = setTimeout(() => setIsInView(true), 1500);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        clearTimeout(fallbackTimer);
        setIsInView(true);
        observer.unobserve(el);
      }
    }, { threshold: 0.1, ...options });
    observer.observe(el);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  return { ref, isInView };
}
