import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Adds the class `is-visible` to every element matching `selector`
 * inside the component's root when it scrolls into view.
 * 
 * Usage:
 *   const el = ref<HTMLElement>()
 *   useScrollAnimation(el)
 *   <div ref="el">...</div>
 */
export function useScrollAnimation(
  containerRef: ReturnType<typeof ref<HTMLElement | null>>,
  selector = '[class*="animate-fade"]',
  threshold = 0.12
) {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const root = containerRef.value || document
    const elements = (root as Element).querySelectorAll
      ? (root as Element).querySelectorAll(selector)
      : document.querySelectorAll(selector)

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target) // fire once
          }
        })
      },
      { threshold }
    )

    elements.forEach((el) => observer!.observe(el))
  })

  onUnmounted(() => observer?.disconnect())
}
