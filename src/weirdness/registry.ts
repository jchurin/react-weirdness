import type { ComponentType } from 'react'
import FirstWeirdness from './FirstWeirdness'

export interface Weirdness {
  /** URL segment: /weirdness/:slug */
  slug: string
  /** Label shown in the sidebar */
  title: string
  /** One-line teaser shown under the page title */
  summary: string
  component: ComponentType
}

/**
 * Every weirdness lives here. Add an entry and it shows up in the
 * sidebar and gets its own route automatically.
 */
export const weirdnesses: Weirdness[] = [
  {
    slug: 'first',
    title: 'Weirdness #1',
    summary: 'Coming soon — details to be filled in.',
    component: FirstWeirdness,
  },
]

export function findWeirdness(slug: string | undefined) {
  return weirdnesses.find((w) => w.slug === slug)
}
