import CodeBlock from '../../components/CodeBlock'
import { FrozenSnapshot, PuzzleCounter, SnapshotCounter, UpdaterCounter } from './demos'
import Quiz from '../../components/Quiz'

const puzzle = `
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return <button onClick={increment}>{count}</button>;
}
`

const whatReactSees = `
// During the render where count === 0, your handler is effectively:
const increment = () => {
  setCount(0 + 1); // "set it to 1"
  setCount(0 + 1); // "set it to 1"
  setCount(0 + 1); // "set it to 1"
};
`

const quizQuestion = (
  <>
    <code>count</code> starts at <code>0</code>. What is it after one click?
  </>
)

const fix = `
const increment = () => {
  setCount(c => c + 1);
  setCount(c => c + 1);
  setCount(c => c + 1);
};
`

/** Shown on the page: just the code and the live bug. */
export function StateSnapshotPuzzle() {
  return (
    <>
      <CodeBlock code={puzzle} highlight={[6, 7, 8]} />
      <PuzzleCounter />
    </>
  )
}

/** Shown in the drawer. */
export function StateSnapshotExplanation() {
  return (
    <>
      <p className="tldr">
        <strong>Short answer:</strong> <code>count</code> is a fixed value for
        each render. All three calls read the same <code>0</code> and ask
        React to "set it to 1".
      </p>

      <section>
        <h3>See it happen</h3>
        <p>Here's the same counter, with a log of what each call received:</p>
        <SnapshotCounter />
      </section>

      <section>
        <h3>1. State is a snapshot, not a live variable</h3>
        <p>
          <code>useState</code> doesn't give you a variable that changes. Each
          render gets its own <code>count</code>. It's a plain{' '}
          <code>const</code> fixed at the moment that render ran. Your{' '}
          <code>increment</code> function was created during that render, so
          its closure holds that render's <code>count</code> for good.
        </p>
        <CodeBlock code={whatReactSees} />
        <p>
          Calling <code>setCount</code> doesn't change <code>count</code>. It
          asks React to render again with a new value. Until that render
          happens, and even inside timeouts set up by this render, you keep
          seeing the old one:
        </p>
        <FrozenSnapshot />
      </section>

      <section>
        <h3>2. Updates are queued and batched</h3>
        <p>
          React doesn't re-render after each <code>setCount</code>. It puts
          the updates in a queue and handles them all together after your
          event handler finishes. This is called <em>batching</em>. It sees
          three "replace the state with 1" instructions, and doing that three
          times still gives 1.
        </p>
        <div className="callout">
          <strong>The snapshot is the real cause, not batching.</strong>{' '}
          Without batching, React would render three times, but your handler
          would still be the old closure where <code>count</code> is{' '}
          <code>0</code>, so every call would still be{' '}
          <code>setCount(1)</code>.
        </div>
      </section>

      <section>
        <h3>The fix: updater functions</h3>
        <p>
          Pass a <em>function</em> instead of a value. React calls each one
          with the result of the previous update, not the stale snapshot:
        </p>
        <CodeBlock code={fix} highlight={[2, 3, 4]} />
        <UpdaterCounter />
        <p>
          Rule of thumb: <strong>if the new state depends on the previous
          state, use the updater form.</strong>
        </p>
      </section>

      <section>
        <h3>Test yourself</h3>
        <p>
          Values and functions can be mixed in one queue. A value replaces the
          state, and a function gets the result so far.
        </p>
        <Quiz
          question={quizQuestion}
          code={`setCount(count + 5);\nsetCount(c => c + 1);`}
          answer="6"
          explanation="The first call queues “replace with 5”. The updater then receives 5 and returns 6."
        />
        <Quiz
          question={quizQuestion}
          code={`setCount(c => c + 1);\nsetCount(c => c + 1);\nsetCount(42);`}
          answer="42"
          explanation="The two updaters take the state from 0 to 2, then “replace with 42” overwrites it."
        />
        <Quiz
          question={quizQuestion}
          code={`setCount(count + 1);\nsetCount(c => c * 10);\nsetCount(count + 2);`}
          answer="2"
          explanation="0 → replace with 1 → 1 × 10 = 10 → replace with 0 + 2 = 2. The last plain value wins, and it was calculated from the stale snapshot."
        />
      </section>

      <section>
        <h3>Takeaways</h3>
        <ul className="takeaways">
          <li>State is fixed for each render. <code>setX</code> schedules a new render and never changes the value you already have.</li>
          <li>React batches updates and applies them all after your handler finishes.</li>
          <li>Use <code>setX(prev =&gt; …)</code> when the next value is based on the previous one.</li>
          <li>Keep updater functions pure. In development, StrictMode calls them twice.</li>
        </ul>
      </section>
    </>
  )
}
