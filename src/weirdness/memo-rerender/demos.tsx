import {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react'
import { useRenderTracker } from '../../components/useRenderTracker'

/* ---------------- Shared card ---------------- */

interface RenderCardProps {
  ref: Ref<HTMLDivElement>
  name: string
  props?: string
  memoized?: boolean
  children?: ReactNode
}

function RenderCard({ ref, name, props, memoized, children }: RenderCardProps) {
  return (
    <div ref={ref} className="render-card">
      <div className="render-card-head">
        <span className="render-name">
          {memoized && <span className="memo-tag">memo</span>}
          {name}
        </span>
        <span className="render-count">
          renders: <strong data-render-count>0</strong>
        </span>
      </div>
      {props && <code className="render-props">{props}</code>}
      {children}
    </div>
  )
}

/* ---------------- Children used in the puzzle ---------------- */

function Child({ label }: { label: string }) {
  const ref = useRenderTracker<HTMLDivElement>()
  return <RenderCard ref={ref} name="Child" props={`label="${label}"`} />
}

const MemoChild = memo(function MemoChild({ label, style }: { label: string; style?: CSSProperties }) {
  const ref = useRenderTracker<HTMLDivElement>()
  return (
    <RenderCard
      ref={ref}
      name="MemoChild"
      memoized
      props={style ? `label="${label}" style={{ color: 'hotpink' }}` : `label="${label}"`}
    />
  )
})

export function PuzzleDemo() {
  const [count, setCount] = useState(0)
  const ref = useRenderTracker<HTMLDivElement>()

  return (
    <div className="demo demo-neutral">
      <div className="demo-head">
        <span className="demo-label">Click and watch the counters</span>
      </div>
      <div className="demo-stack">
        <RenderCard ref={ref} name="Parent" props={`count = ${count}`}>
          <button className="secondary-btn" onClick={() => setCount(count + 1)}>
            Re-render parent
          </button>
          <div className="render-children">
            <Child label="hello" />
            <MemoChild label="hello" />
            <MemoChild label="hello" style={{ color: 'hotpink' }} />
          </div>
        </RenderCard>
      </div>
    </div>
  )
}

/* ---------------- Memo lab: stabilize props one by one ---------------- */

const LabChild = memo(function LabChild({
  label,
  style,
  onSelect,
}: {
  label: string
  style: CSSProperties
  onSelect: () => void
}) {
  const ref = useRenderTracker<HTMLDivElement>()
  return (
    <RenderCard ref={ref} name="LabChild" memoized props="label, style, onSelect">
      <button className="like-btn" style={style} onClick={onSelect}>
        {label}
      </button>
    </RenderCard>
  )
})

export function MemoLab() {
  const [count, setCount] = useState(0)
  const [stableStyle, setStableStyle] = useState(false)
  const [stableHandler, setStableHandler] = useState(false)
  const ref = useRenderTracker<HTMLDivElement>()

  const memoStyle = useMemo(() => ({ color: 'hotpink' }), [])
  const memoHandler = useCallback(() => {}, [])

  const style = stableStyle ? memoStyle : { color: 'hotpink' }
  const onSelect = stableHandler ? memoHandler : () => {}

  return (
    <div className="demo demo-neutral">
      <div className="demo-head">
        <span className="demo-label">Stabilize the props</span>
      </div>
      <div className="demo-stack">
        <label className="toggle">
          <input type="checkbox" checked={stableStyle} onChange={(e) => setStableStyle(e.target.checked)} />
          <span>
            <code>style</code> with <code>useMemo</code>
          </span>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={stableHandler} onChange={(e) => setStableHandler(e.target.checked)} />
          <span>
            <code>onSelect</code> with <code>useCallback</code>
          </span>
        </label>
        <RenderCard ref={ref} name="Parent" props={`count = ${count}`}>
          <button className="secondary-btn" onClick={() => setCount(count + 1)}>
            Re-render parent
          </button>
          <div className="render-children">
            <LabChild label="Click me" style={style} onSelect={onSelect} />
          </div>
        </RenderCard>
      </div>
    </div>
  )
}

/* ---------------- Context goes straight through memo ---------------- */

const ThemeContext = createContext<'light' | 'dark'>('dark')

const ThemedMemoChild = memo(function ThemedMemoChild() {
  const theme = useContext(ThemeContext)
  const ref = useRenderTracker<HTMLDivElement>()
  return <RenderCard ref={ref} name="ThemedChild" memoized props={`no props · theme = ${theme}`} />
})

export function ContextDemo() {
  const [count, setCount] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const ref = useRenderTracker<HTMLDivElement>()

  return (
    <div className="demo demo-bad">
      <div className="demo-head">
        <span className="demo-label">memo vs context</span>
      </div>
      <div className="demo-stack">
        <RenderCard ref={ref} name="Parent" props={`count = ${count} · theme = ${theme}`}>
          <div className="list-controls">
            <button className="secondary-btn" onClick={() => setCount(count + 1)}>
              Re-render parent
            </button>
            <button className="secondary-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              Toggle theme
            </button>
          </div>
          <ThemeContext value={theme}>
            <div className="render-children">
              <ThemedMemoChild />
            </div>
          </ThemeContext>
        </RenderCard>
      </div>
    </div>
  )
}
