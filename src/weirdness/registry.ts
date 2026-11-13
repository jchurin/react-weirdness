import type { ComponentType } from 'react'
import { KeyResetExplanation, KeyResetPuzzle } from './key-reset/KeyReset'
import { IndexKeysExplanation, IndexKeysPuzzle } from './index-keys/IndexKeys'
import { EffectLoopExplanation, EffectLoopPuzzle } from './effect-loop/EffectLoop'
import { MemoRerenderExplanation, MemoRerenderPuzzle } from './memo-rerender/MemoRerender'
import { StaleClosureExplanation, StaleClosurePuzzle } from './stale-closure/StaleClosure'
import { StrayZeroExplanation, StrayZeroPuzzle } from './stray-zero/StrayZero'
import { InnerComponentExplanation, InnerComponentPuzzle } from './inner-component/InnerComponent'
import { FetchRaceExplanation, FetchRacePuzzle } from './fetch-race/FetchRace'
import { StateSnapshotExplanation, StateSnapshotPuzzle } from './state-snapshot/StateSnapshot'

export interface Weirdness {
  /** URL segment: /weirdness/:slug */
  slug: string
  /** Label shown in the sidebar and as the page title */
  title: string
  /** The question shown under the title */
  summary: string
  /** Shown on the page: the code and a live demo of the weird behaviour */
  Puzzle: ComponentType
  /** Shown in the right drawer, only when the user asks for it */
  Explanation: ComponentType
}

/**
 * Every weirdness lives here. Add an entry and it shows up in the
 * sidebar and gets its own route automatically.
 */
export const weirdnesses: Weirdness[] = [
  {
    slug: 'state-snapshot',
    title: 'Three setStates, one +1',
    summary: 'This counter calls setCount(count + 1) three times per click. Why doesnât it go up by 3?',
    Puzzle: StateSnapshotPuzzle,
    Explanation: StateSnapshotExplanation,
  },
  {
    slug: 'key-reset',
    title: 'The key that isnât for lists',
    summary:
      'Profile has a key, but it isnât in a list. What happens to Profile, and to its child LikeButton, when the key changes?',
    Puzzle: KeyResetPuzzle,
    Explanation: KeyResetExplanation,
  },
  {
    slug: 'index-keys',
    title: 'The checkbox that moved',
    summary:
      'Each row keeps its own checkbox and note state. Tick an item, add a new one to the top, and see where your tick ends up.',
    Puzzle: IndexKeysPuzzle,
    Explanation: IndexKeysExplanation,
  },
  {
    slug: 'effect-loop',
    title: 'The effect that never sleeps',
    summary:
      'This effect bumps count after every render. Why does it never stop? And would an empty dependency array fix it?',
    Puzzle: EffectLoopPuzzle,
    Explanation: EffectLoopExplanation,
  },
  {
    slug: 'memo-rerender',
    title: 'Same props, still rendering',
    summary:
      'The parent re-renders, but the child’s props are exactly the same. Will the child render again? Does React.memo guarantee it won’t?',
    Puzzle: MemoRerenderPuzzle,
    Explanation: MemoRerenderExplanation,
  },
  {
    slug: 'stale-closure',
    title: 'The interval stuck in the past',
    summary:
      'The number on the button goes up, but the interval keeps logging 0. Why isn’t React updating the value?',
    Puzzle: StaleClosurePuzzle,
    Explanation: StaleClosureExplanation,
  },
  {
    slug: 'stray-zero',
    title: 'The mysterious 0',
    summary: 'When the cart is empty, a lonely 0 shows up on the page. Nobody wrote a 0. Where does it come from?',
    Puzzle: StrayZeroPuzzle,
    Explanation: StrayZeroExplanation,
  },
  {
    slug: 'inner-component',
    title: 'The input that forgets',
    summary: 'Every time you type a letter, the input loses focus. The code looks perfectly reasonable. What’s going on?',
    Puzzle: InnerComponentPuzzle,
    Explanation: InnerComponentExplanation,
  },
  {
    slug: 'fetch-race',
    title: 'The response that arrived late',
    summary: 'Pick a user and their profile loads. Switch users quickly, and the wrong profile wins. Why?',
    Puzzle: FetchRacePuzzle,
    Explanation: FetchRaceExplanation,
  },
]

export function findWeirdness(slug: string | undefined) {
  return weirdnesses.find((w) => w.slug === slug)
}
