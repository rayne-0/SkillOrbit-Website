import { useEffect, useRef } from 'react';

/**
 * Adds the class `is-visible` to every element matching `selector`
 * inside `rootRef` when it scrolls into view.
 *
 * Usage:
 *   const ref = useScrollAnimation();
 *   <section ref={ref} className="fade-up">…</section>
 */
export default function useScrollAnimation(selector = '[class*="animate"]', threshold = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current || document;
    const elements = root.querySelectorAll ? root.querySelectorAll(selector) : document.querySelectorAll(selector);

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selector, threshold]);

  return ref;
}
