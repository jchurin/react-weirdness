import { useCallback, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import Drawer from '../components/Drawer'
import { findWeirdness, type Weirdness } from '../weirdness/registry'

export default function WeirdnessPage() {
  const { slug } = useParams()
  const weirdness = findWeirdness(slug)

  if (!weirdness) return <Navigate to="/" replace />

  // key: reset drawer + demo state when navigating between weirdnesses
  return <WeirdnessView key={weirdness.slug} weirdness={weirdness} />
}

function WeirdnessView({ weirdness }: { weirdness: Weirdness }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const { Puzzle, Explanation } = weirdness

  return (
    <article className="page">
      <h1>{weirdness.title}</h1>
      <p className="lead">{weirdness.summary}</p>

      <Puzzle />

      <button className="cta" onClick={() => setOpen(true)}>
        Why does this happen? →
      </button>

      <Drawer open={open} onClose={close} title="Why does this happen?">
        <Explanation />
      </Drawer>
    </article>
  )
}
