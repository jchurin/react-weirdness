import { useEffect, useRef } from 'react'

/**
 * Counts how many times a component rendered (and committed), and flashes it.
 *
 * Attach the returned ref to the component's root element. It must contain an
 * element with a `data-render-count` attribute, which gets the count.
 *
 * Why not just `useState` or `ref.current++` during render?
 * - Setting state would cause another render (and change what we measure).
 * - In StrictMode, React calls render twice in development, so a counter
 *   bumped during render would double.
 * Instead each render creates a token object, and the effect only counts a
 * token it hasn't seen. StrictMode's dev-only effect re-run reuses the same
 * token, so it isn't counted twice.
 */
export function useRenderTracker<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const count = useRef(0)
  const lastToken = useRef<object | null>(null)
  const token = {}

  useEffect(() => {
    if (lastToken.current === token) return
    lastToken.current = token
    count.current++

    const el = ref.current
    if (!el) return
    const counter = el.querySelector('[data-render-count]')
    if (counter) counter.textContent = String(count.current)
    // restart the flash animation
    el.classList.remove('render-flash')
    void el.offsetWidth
    el.classList.add('render-flash')
  })

  return ref
}
