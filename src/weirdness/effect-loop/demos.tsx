import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Stop the "infinite" loop after this many effect runs so the tab survives. */
const BRAKE_LIMIT = 200

/** The puzzle, exactly as written, plus a safety brake. */
function NoDepsCounter() {
  const [count, setCount] = useState(0)
  const [braked, setBraked] = useState<{ runs: number; ms: number } | null>(null)
  const [startedAt] = useState(() => performance.now())
  const runs = useRef(0)
  const stopped = useRef(false)

  // Intentionally broken: this IS the weirdness. The linter is right to complain.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (stopped.current) return
    runs.current++
    if (runs.current > BRAKE_LIMIT) {
      stopped.current = true
      setBraked({ runs: BRAKE_LIMIT, ms: Math.round(performance.now() - startedAt) })
      return
    }
    setCount((c) => c + 1)
  }) // ← no dependency array

  return (
    <>
      <div className="big-count">{count}</div>
      {braked && (
        <p className="brake-msg">
          🛑 Safety brake pulled after {braked.runs} renders ({braked.ms} ms). Without it,
          this would never stop.
        </p>
      )}
    </>
  )
}

function EmptyDepsCounter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Intentionally the "fix" from the puzzle, StrictMode double-run and all.
    // oxlint-disable-next-line react/set-state-in-effect
    setCount((c) => c + 1)
  }, [])

  return <div className="big-count">{count}</div>
}

/** Mounts its child only after "Run", and remounts it (new key) on every run. */
function Runner({ label, tone, children }: { label: string; tone: string; children: ReactNode }) {
  const [run, setRun] = useState(0)
  return (
    <div className={`demo demo-${tone}`}>
      <div className="demo-head">
        <span className="demo-label">{label}</span>
      </div>
      <div className="demo-body puzzle-body">
        <button className="secondary-btn" onClick={() => setRun(run + 1)}>
          {run ? 'Run again' : 'Run it'}
        </button>
        <div className="runner-output" key={run}>
          {run ? children : <span className="hint">Not mounted yet</span>}
        </div>
      </div>
    </div>
  )
}

export function NoDepsDemo({ tone = 'neutral' }: { tone?: string }) {
  return (
    <Runner label="useEffect(() => …)" tone={tone}>
      <NoDepsCounter />
    </Runner>
  )
}

export function EmptyDepsDemo({ tone = 'neutral' }: { tone?: string }) {
  return (
    <Runner label="useEffect(() => …, [])" tone={tone}>
      <EmptyDepsCounter />
    </Runner>
  )
}

/* ---------------- Slow-motion cycle (a simulation, for illustration) ---------------- */

type Step = 'render' | 'commit' | 'effect' | 'set' | 'skip' | 'idle'

const STEPS: { id: Step; label: string }[] = [
  { id: 'render', label: 'Render' },
  { id: 'commit', label: 'Update the screen' },
  { id: 'effect', label: 'Run effect' },
  { id: 'set', label: 'setCount → schedule render' },
]

const noDepsSequence: Step[] = ['render', 'commit', 'effect', 'set']
const emptyDepsSequence: Step[] = ['render', 'commit', 'effect', 'set', 'render', 'commit', 'skip', 'idle']

export function CycleStepper() {
  const [mode, setMode] = useState<'none' | 'empty'>('none')
  const [tick, setTick] = useState(0)
  const [playing, setPlaying] = useState(true)

  const sequence = mode === 'none' ? noDepsSequence : emptyDepsSequence
  const step = mode === 'none' ? sequence[tick % sequence.length] : sequence[Math.min(tick, sequence.length - 1)]
  const finished = mode === 'empty' && step === 'idle'
  // count = number of completed "set" steps so far
  const count =
    mode === 'none'
      ? Math.floor((tick + 1) / sequence.length)
      : sequence.slice(0, tick + 1).filter((s) => s === 'set').length

  useEffect(() => {
    if (!playing || finished) return
    const t = setTimeout(() => setTick((n) => n + 1), 800)
    return () => clearTimeout(t)
  }, [playing, finished, tick])

  const switchMode = (m: 'none' | 'empty') => {
    setMode(m)
    setTick(0)
    setPlaying(true)
  }

  return (
    <div className="demo demo-neutral">
      <div className="demo-head">
        <div className="segmented">
          <button className={mode === 'none' ? 'active' : ''} onClick={() => switchMode('none')}>
            no deps
          </button>
          <button className={mode === 'empty' ? 'active' : ''} onClick={() => switchMode('empty')}>
            [ ]
          </button>
        </div>
        <span>
          count = <strong>{count}</strong>
        </span>
      </div>
      <div className="demo-stack">
        <ol className="cycle">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={
                step === s.id ? 'cycle-step active' : step === 'skip' && s.id === 'effect' ? 'cycle-step skipped' : 'cycle-step'
              }
            >
              {s.label}
            </li>
          ))}
        </ol>
        <p className="cycle-caption">
          {step === 'skip'
            ? 'Deps [] haven’t changed since the last run, so React skips the effect.'
            : finished
              ? 'Nothing left to do. The loop is over (count = 1 in production).'
              : mode === 'none'
                ? 'No dependency array: the effect runs after every render. Forever.'
                : 'Empty array: the effect runs after the first render only.'}
        </p>
        <div className="list-controls">
          <button className="secondary-btn" onClick={() => setPlaying(!playing)} disabled={finished}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button className="secondary-btn" onClick={() => switchMode(mode)}>
            Restart
          </button>
        </div>
      </div>
    </div>
  )
}
