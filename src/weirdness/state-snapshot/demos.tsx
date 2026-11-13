import { useState } from 'react'

type LogEntry = string[]

/**
 * The "broken" counter from the puzzle, plus a log of what each
 * setCount call actually received.
 *
 * Note: the log is computed in the event handler, never inside an updater
 * function. Updaters must be pure — in StrictMode React calls them twice
 * in development, which would double any logging done there.
 */
export function SnapshotCounter() {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState<LogEntry>([])

  const increment = () => {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
    setLog([
      `count in this render = ${count}`,
      `setCount(${count} + 1)  → queue: "replace with ${count + 1}"`,
      `setCount(${count} + 1)  → queue: "replace with ${count + 1}"`,
      `setCount(${count} + 1)  → queue: "replace with ${count + 1}"`,
      `next render: count = ${count + 1}`,
    ])
  }

  return (
    <DemoShell
      label="setCount(count + 1) × 3"
      tone="bad"
      count={count}
      onClick={increment}
      onReset={() => {
        setCount(0)
        setLog([])
      }}
      log={log}
    />
  )
}

export function UpdaterCounter() {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState<LogEntry>([])

  const increment = () => {
    setCount((c) => c + 1)
    setCount((c) => c + 1)
    setCount((c) => c + 1)
    setLog([
      `count in this render = ${count}`,
      `setCount(c => c + 1)  → c = ${count}, returns ${count + 1}`,
      `setCount(c => c + 1)  → c = ${count + 1}, returns ${count + 2}`,
      `setCount(c => c + 1)  → c = ${count + 2}, returns ${count + 3}`,
      `next render: count = ${count + 3}`,
    ])
  }

  return (
    <DemoShell
      label="setCount(c => c + 1) × 3"
      tone="good"
      count={count}
      onClick={increment}
      onReset={() => {
        setCount(0)
        setLog([])
      }}
      log={log}
    />
  )
}

/**
 * Shows that `count` stays the same for the whole handler, even after
 * calling setCount and even after waiting.
 */
export function FrozenSnapshot() {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState<LogEntry>([])

  const increment = () => {
    const lines = [`before setCount: count = ${count}`]
    setCount(count + 1)
    lines.push(`right after setCount: count = ${count}`)
    setLog(lines)
    setTimeout(() => {
      setLog([...lines, `1 second later: count = ${count}   (still!)`])
    }, 1000)
  }

  return (
    <DemoShell
      label="Read count after setting it"
      tone="neutral"
      count={count}
      onClick={increment}
      onReset={() => {
        setCount(0)
        setLog([])
      }}
      log={log}
    />
  )
}

interface DemoShellProps {
  label: string
  tone: 'bad' | 'good' | 'neutral'
  count: number
  onClick: () => void
  onReset: () => void
  log: LogEntry
}

function DemoShell({ label, tone, count, onClick, onReset, log }: DemoShellProps) {
  return (
    <div className={`demo demo-${tone}`}>
      <div className="demo-head">
        <span className="demo-label">{label}</span>
        <button className="link-btn" onClick={onReset}>
          reset
        </button>
      </div>
      <div className="demo-body">
        <button className="counter-btn" onClick={onClick}>
          {count}
        </button>
        <pre className="demo-log">
          {log.length ? log.join('\n') : 'Click the button…'}
        </pre>
      </div>
    </div>
  )
}

/** The puzzle as-is, with just a tally of expected vs actual. */
export function PuzzleCounter() {
  const [count, setCount] = useState(0)
  const [clicks, setClicks] = useState(0)

  const increment = () => {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
    setClicks((n) => n + 1)
  }

  return (
    <div className="demo demo-bad">
      <div className="demo-head">
        <span className="demo-label">Try it</span>
        <button
          className="link-btn"
          onClick={() => {
            setCount(0)
            setClicks(0)
          }}
        >
          reset
        </button>
      </div>
      <div className="demo-body puzzle-body">
        <button className="counter-btn" onClick={increment}>
          {count}
        </button>
        <dl className="tally">
          <div><dt>Clicks</dt><dd>{clicks}</dd></div>
          <div><dt>Expected</dt><dd>{clicks * 3}</dd></div>
          <div className={clicks ? 'tally-wrong' : ''}><dt>Got</dt><dd>{count}</dd></div>
        </dl>
      </div>
    </div>
  )
}
