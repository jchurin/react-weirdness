import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react'

type Variant = 'stale' | 'deps' | 'ref' | 'effectEvent'

const MAX_LINES = 6
const time = () => new Date().toLocaleTimeString()
const logLine = (value: number, how: string) => `[${time()}] ${how} → ${value}`

/* ---------------- Shared UI ---------------- */

interface CounterViewProps {
  count: number
  onIncrement: () => void
  logs: string[]
  /** Which count value the interval callback will read */
  seen: 'first' | 'latest'
}

function CounterView({ count, onIncrement, logs, seen }: CounterViewProps) {
  const values = Array.from({ length: count + 1 }, (_, i) => i).slice(-8)
  const seenValue = seen === 'first' ? 0 : count

  return (
    <>
      <div className="demo-body puzzle-body">
        <button className="counter-btn" onClick={onIncrement}>
          {count}
        </button>
        <pre className="demo-log fake-console">
          {logs.length ? logs.join('\n') : 'Waiting for the first tick…'}
        </pre>
      </div>
      <div className="snapshots">
        <span className="snapshots-label">Renders:</span>
        {seen === 'first' && values[0] !== 0 && <span className="snapshot seen">count = 0</span>}
        {seen === 'first' && values[0] !== 0 && <span className="snapshots-gap">…</span>}
        {values.map((v) => (
          <span key={v} className={v === seenValue ? 'snapshot seen' : 'snapshot'}>
            count = {v}
          </span>
        ))}
        <span className="snapshots-hint">
          highlighted = the value the interval reads
        </span>
      </div>
    </>
  )
}

/* ---------------- Variants ---------------- */

/** The puzzle, as written. */
function StaleCounter() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count)
      setLogs((l) => [...l, logLine(count, 'console.log(count)')].slice(-MAX_LINES))
    }, 1000)
    return () => clearInterval(interval)
    // Intentionally stale: this IS the weirdness. The linter is right to complain.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <CounterView count={count} onIncrement={() => setCount((c) => c + 1)} logs={logs} seen="first" />
}

/** Fix 1: list count as a dependency. Correct, but restarts the timer on every change. */
function DepsCounter() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((l) => [...l, logLine(count, 'console.log(count)')].slice(-MAX_LINES))
    }, 1000)
    return () => clearInterval(interval)
  }, [count])

  return <CounterView count={count} onIncrement={() => setCount((c) => c + 1)} logs={logs} seen="latest" />
}

/** Fix 2: keep the latest value in a ref; the interval reads the ref. */
function RefCounter() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const countRef = useRef(count)

  useEffect(() => {
    countRef.current = count
  }, [count])

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((l) => [...l, logLine(countRef.current, 'countRef.current')].slice(-MAX_LINES))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return <CounterView count={count} onIncrement={() => setCount((c) => c + 1)} logs={logs} seen="latest" />
}

/** Fix 3: useEffectEvent, React's built-in "read the latest props/state from an effect". */
function EffectEventCounter() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const onTick = useEffectEvent(() => {
    setLogs((l) => [...l, logLine(count, 'onTick()')].slice(-MAX_LINES))
  })

  useEffect(() => {
    const interval = setInterval(() => onTick(), 1000)
    return () => clearInterval(interval)
  }, [])

  return <CounterView count={count} onIncrement={() => setCount((c) => c + 1)} logs={logs} seen="latest" />
}

const variants: Record<Variant, () => ReactNode> = {
  stale: () => <StaleCounter />,
  deps: () => <DepsCounter />,
  ref: () => <RefCounter />,
  effectEvent: () => <EffectEventCounter />,
}

/* ---------------- Shell with start / stop ---------------- */

interface IntervalDemoProps {
  variant: Variant
  label: string
  tone?: 'bad' | 'good' | 'neutral'
}

export function IntervalDemo({ variant, label, tone = 'neutral' }: IntervalDemoProps) {
  // Each start mounts a fresh component (new key), so its interval starts clean.
  // Stopping unmounts it, which runs the effect cleanup and clears the interval.
  const [run, setRun] = useState(0)
  const [running, setRunning] = useState(false)

  return (
    <div className={`demo demo-${tone}`}>
      <div className="demo-head">
        <span className="demo-label">{label}</span>
        <button
          className="link-btn"
          onClick={() => {
            if (!running) setRun(run + 1)
            setRunning(!running)
          }}
        >
          {running ? 'stop' : run ? 'restart' : 'start'}
        </button>
      </div>
      {running ? (
        <div key={run}>{variants[variant]()}</div>
      ) : (
        <div className="demo-body">
          <button
            className="secondary-btn"
            onClick={() => {
              setRun(run + 1)
              setRunning(true)
            }}
          >
            Start the interval
          </button>
        </div>
      )}
    </div>
  )
}
