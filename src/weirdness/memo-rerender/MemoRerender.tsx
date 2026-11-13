import CodeBlock from '../../components/CodeBlock'
import Quiz from '../../components/Quiz'
import { ContextDemo, MemoLab, PuzzleDemo } from './demos'

const puzzle = `
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Re-render parent</button>
      <Child label="hello" />
      <MemoChild label="hello" />
      <MemoChild label="hello" style={{ color: 'hotpink' }} />
    </>
  );
}

const MemoChild = memo(function MemoChild({ label, style }) {
  return <p style={style}>{label}</p>;
});
`

const shallowCompare = `
// For each prop, memo checks Object.is(oldProp, newProp)
Object.is('hello', 'hello')                  // true  ✓ skip
Object.is(42, 42)                            // true  ✓ skip
Object.is({ color: 'hotpink' },
          { color: 'hotpink' })              // false ✗ render
Object.is([], [])                            // false ✗ render
Object.is(() => {}, () => {})                // false ✗ render
Object.is(<span />, <span />)                // false ✗ render (children!)
`

const stableProps = `
const style = useMemo(() => ({ color: 'hotpink' }), []);
const onSelect = useCallback(() => select(id), [id]);

<MemoChild label="hello" style={style} onSelect={onSelect} />
`

const contentUp = `
// The slow part doesn't depend on Parent's state, so pass it in as children
function Parent({ children }) {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>+1</button>
      {children}
    </>
  );
}

<Parent>
  <SlowTree />   {/* created by the grandparent, not re-rendered by Parent */}
</Parent>
`

/** Shown on the page: the code and the live demo. */
export function MemoRerenderPuzzle() {
  return (
    <>
      <CodeBlock code={puzzle} highlight={[6, 7, 8]} />
      <p className="hint">
        None of the children's props change between renders. Click{' '}
        <strong>Re-render parent</strong> and watch which counters go up.
      </p>
      <PuzzleDemo />
    </>
  )
}

/** Shown in the drawer. */
export function MemoRerenderExplanation() {
  return (
    <>
      <p className="tldr">
        <strong>Short answer:</strong> yes, by default a child renders{' '}
        <em>every time its parent renders</em>, whatever its props are.{' '}
        <code>memo</code> lets React skip that, but only when every prop is
        the <em>same reference</em>, and even then it's a performance hint,
        not a guarantee.
      </p>

      <section>
        <h3>The default: parent renders, children render</h3>
        <p>
          React doesn't check props before rendering a child. When{' '}
          <code>Parent</code> renders, it calls every component in its output,
          and those call theirs, all the way down. "Props didn't change" isn't
          part of the decision.
        </p>
        <p>
          That sounds wasteful, but it usually isn't. A render is just React
          calling your function. React then compares the result with the
          previous one and only touches the DOM where something actually
          changed. A re-render with identical output updates nothing on screen.
        </p>
      </section>

      <section>
        <h3>What memo actually checks</h3>
        <p>
          <code>memo(Component)</code> adds a check: before rendering, compare
          each new prop with the old one using <code>Object.is</code>. If all
          of them are the same, React reuses the last result and skips the
          render.
        </p>
        <CodeBlock code={shallowCompare} />
        <p>
          That's why the third child in the puzzle re-renders.{' '}
          <code>{'style={{ color: \'hotpink\' }}'}</code> creates a{' '}
          <em>new object</em> on every render of <code>Parent</code>. It looks
          the same, but it isn't the same object, so <code>memo</code> treats
          it as a change.
        </p>
      </section>

      <section>
        <h3>Making memo work: stable references</h3>
        <p>
          <code>useMemo</code> and <code>useCallback</code> keep the same
          object or function between renders until their dependencies change.
          Turn on one checkbox, then both. <code>memo</code> only skips the
          render when <em>every</em> prop is stable:
        </p>
        <MemoLab />
        <CodeBlock code={stableProps} />
      </section>

      <section>
        <h3>What memo can't stop</h3>
        <ul className="takeaways">
          <li>
            <strong>Its own state:</strong> <code>memo</code> only looks at
            props. A child's own <code>setState</code> always renders it.
          </li>
          <li>
            <strong>Context:</strong> if the child reads a context and its
            value changes, the child renders, whether or not it's memoized.
          </li>
          <li>
            <strong>React itself:</strong> the docs call <code>memo</code> a
            performance optimization, not a guarantee. React may still choose
            to render. Your component must behave correctly either way.
          </li>
        </ul>
        <ContextDemo />
        <p>
          <strong>Re-render parent</strong> is skipped, because the child has
          no props. <strong>Toggle theme</strong> goes straight through{' '}
          <code>memo</code>.
        </p>
      </section>

      <section>
        <h3>Often better than memo: move things around</h3>
        <p>
          Elements passed as <code>children</code> are created by the
          component <em>above</em>. When <code>Parent</code>'s own state
          changes, the <code>children</code> it received are the exact same
          object as last time, so React skips them, with no <code>memo</code>{' '}
          needed:
        </p>
        <CodeBlock code={contentUp} />
        <div className="callout">
          <strong>Got the React Compiler?</strong> It inserts the equivalent of{' '}
          <code>memo</code>, <code>useMemo</code> and <code>useCallback</code>{' '}
          for you at build time, which removes most of this busywork. The rules
          about what causes a render stay the same.
        </div>
      </section>

      <section>
        <h3>Test yourself</h3>
        <Quiz
          question="MemoList is wrapped in memo. Does it re-render when its parent re-renders?"
          code={`<MemoList items={todos.filter(t => !t.done)} />`}
          answer="Yes, every time"
          explanation=".filter() returns a new array on every render, even if it holds the same todos. Wrap it in useMemo with [todos] as the dependency."
        />
        <Quiz
          question="MemoCard is wrapped in memo. Does it re-render when its parent re-renders?"
          code={`<MemoCard>\n  <Avatar />\n</MemoCard>`}
          answer="Yes, every time"
          explanation="children is a prop too, and <Avatar /> creates a new element object on every render. Children in JSX quietly break memo."
        />
        <Quiz
          question="Parent's count changes. Does Child re-render? (No memo anywhere.)"
          code={`function Parent({ children }) {\n  const [count, setCount] = useState(0);\n  return <div onClick={() => setCount(count + 1)}>{children}</div>;\n}\n\n<Parent>\n  <Child />\n</Parent>`}
          answer="No"
          explanation="<Child /> was created by the component that renders <Parent>, not by Parent. When only Parent's state changes, children is the same element as before, so React skips it."
        />
      </section>

      <section>
        <h3>Takeaways</h3>
        <ul className="takeaways">
          <li>By default, every render of a parent renders all of its children, whatever their props.</li>
          <li>A render isn't a DOM update. React only changes the DOM where the output differs.</li>
          <li><code>memo</code> skips the render only if every prop passes <code>Object.is</code>. Inline objects, arrays, functions and JSX children all fail that check.</li>
          <li><code>memo</code> can't block the component's own state or context changes, and it's a hint, not a guarantee.</li>
          <li>Measure before optimizing. Passing content as <code>children</code> often beats adding <code>memo</code>.</li>
        </ul>
      </section>
    </>
  )
}
