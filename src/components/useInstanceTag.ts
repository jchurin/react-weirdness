import { useState } from 'react'

/**
 * Gives each component instance a random tag and the time it mounted.
 * A new tag means React threw the old instance away and created a new one.
 *
 * (In StrictMode the initializer runs twice, but React keeps only one result,
 * so this stays stable for the lifetime of the instance.)
 */
export function useInstanceTag() {
  const [tag] = useState(() => ({
    id: Math.random().toString(16).slice(2, 6),
    mountedAt: new Date().toLocaleTimeString(),
  }))
  return tag
}
