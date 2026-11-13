import { useEffect, useRef, useState } from 'react'

type UserId = 'alice' | 'bob' | 'carol'

interface User {
  id: UserId
  name: string
  role: string
  avatar: string
}

const USERS: Record<UserId, User> = {
  alice: { id: 'alice', name: 'Alice', role: 'Designer', avatar: '🦊' },
  bob: { id: 'bob', name: 'Bob', role: 'Backend dev', avatar: '🐻' },
  carol: { id: 'carol', name: 'Carol', role: 'Product manager', avatar: '🦉' },
}

/** Fixed delays so the race is easy to reproduce: Alice's server is slow. */
const DELAYS: Record<UserId, number> = { alice: 3000, bob: 600, carol: 1500 }

/** A fake fetch with a fixed delay per user. Supports AbortSignal like fetch(). */
function fetchUser(id: UserId, signal?: AbortSignal): Promise<User> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(USERS[id]), DELAYS[id])
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

type Strategy = 'none' | 'ignore' | 'abort'

const LABELS: Record<Strategy, string> = {
  none: 'no cleanup',
  ignore: 'cleanup: ignore = true',
  abort: 'cleanup: controller.abort()',
}

const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`

export function RaceDemo({ strategy, tone = 'neutral' }: { strategy: Strategy; tone?: string }) {
  const [userId, setUserId] = useState<UserId | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [log, setLog] = useState<string[]>([])
  const startedAt = useRef(0)
  // Only used to annotate the log. Effects run after render, so this holds
  // the latest selection by the time any response arrives.
  const latestId = useRef<UserId | null>(null)

  const addLog = (line: string) => {
    const t = startedAt.current ? secs(performance.now() - startedAt.current) : '0.0s'
    setLog((l) => [...l, `${t.padStart(5)}  ${line}`].slice(-8))
  }

  const select = (id: UserId) => {
    if (!startedAt.current) startedAt.current = performance.now()
    addLog(`→ request ${USERS[id].name} (takes ${secs(DELAYS[id])})`)
    setUserId(id)
  }

  useEffect(() => {
    latestId.current = userId
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const name = USERS[userId].name

    if (strategy === 'none') {
      fetchUser(userId).then((u) => {
        const stale = latestId.current !== u.id
        addLog(`← ${u.name} arrived → setUser(${u.name})${stale ? '   ⚠️ stale!' : ''}`)
        setUser(u)
      })
      return
    }

    if (strategy === 'ignore') {
      let ignore = false
      fetchUser(userId).then((u) => {
        if (ignore) {
          addLog(`← ${u.name} arrived → ignored (stale)`)
          return
        }
        addLog(`← ${u.name} arrived → setUser(${u.name})`)
        setUser(u)
      })
      return () => {
        ignore = true
      }
    }

    const controller = new AbortController()
    fetchUser(userId, controller.signal)
      .then((u) => {
        addLog(`← ${u.name} arrived → setUser(${u.name})`)
        setUser(u)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') addLog(`✕ ${name} request aborted`)
      })
    return () => controller.abort()
    // addLog only appends to the demo's log panel; leaving it out is deliberate.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, strategy])

  const loading = userId !== null && user?.id !== userId
  const wrong = !!user && !!userId && user.id !== userId

  const reset = () => {
    setUserId(null)
    setUser(null)
    setLog([])
    startedAt.current = 0
  }

  return (
    <div className={`demo demo-${tone}`}>
      <div className="demo-head">
        <span className="demo-label">{LABELS[strategy]}</span>
        <button className="link-btn" onClick={reset}>
          reset
        </button>
      </div>
      <div className="demo-stack">
        <div className="list-controls">
          {(Object.keys(USERS) as UserId[]).map((id) => (
            <button
              key={id}
              className={userId === id ? 'secondary-btn selected' : 'secondary-btn'}
              onClick={() => select(id)}
            >
              {USERS[id].avatar} {USERS[id].name} <span className="delay">{secs(DELAYS[id])}</span>
            </button>
          ))}
        </div>

        <div className={wrong ? 'profile-card wrong' : 'profile-card'}>
          <div className="profile-selected">
            Selected: <strong>{userId ? USERS[userId].name : '—'}</strong>
            {loading && <span className="spinner" aria-label="loading" />}
          </div>
          {user ? (
            <div className="profile-body">
              <span className="profile-avatar">{user.avatar}</span>
              <div>
                <div className="profile-name">{user.name}</div>
                <div className="mini-sub">{user.role}</div>
              </div>
            </div>
          ) : (
            <div className="mini-sub">Pick a user</div>
          )}
          {wrong && !loading && <div className="profile-warning">⚠️ Showing {user!.name}, but you selected {USERS[userId!].name}</div>}
        </div>

        <pre className="demo-log race-log">{log.length ? log.join('\n') : 'Network log…'}</pre>
      </div>
    </div>
  )
}
