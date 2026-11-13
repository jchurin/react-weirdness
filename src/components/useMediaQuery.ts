import { useSyncExternalStore } from 'react'

/** Live boolean for a CSS media query, e.g. useMediaQuery('(max-width: 860px)'). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
