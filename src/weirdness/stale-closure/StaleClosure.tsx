import CodeBlock from '../../components/CodeBlock'
import Quiz from '../../components/Quiz'
import { IntervalDemo } from './demos'

const puzzle = `
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
}
`

const closures = `
// Render 1: count = 0
const count = 0;
useEffect(() => {                  // runs (deps [] → only this once)
  setInterval(() => {
    console.log(count);            // ← this "count" is the const above: 0
  }, 1000);
}, []);

// Render 2: count = 1
const count = 1;
useEffect(() => { ... }, []);      // deps unchanged → React skips it.
                                   // Nobody ever creates an interval that sees 1.
`

const depsFix = `
useEffect(() => {
  const interval = setInterval(() => {
    console.log(count);
  }, 1000);
  return () => clearInterval(interval);
}, [count]);   // new count → clean up the old interval, start a new one
`

const refFix = `
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;          // always holds the latest value
}, [count]);

useEffect(() => {
  const interval = setInterval(() => {
    console.log(countRef.current);   // a ref is one object shared by every render
  }, 1000);
  return () => clearInterval(interval);
}, []);
`

const effectEventFix = `
const onTick = useEffectEvent(() => {
  console.log(count);                // always sees the latest render's values
});

useEffect(() => {
  const interval = setInterval(() => onTick(), 1000);
  return () => clearInterval(interval);
}, []);                              // onTick doesn't need to be a dependency
`

/** Shown on the page: the code and the live demo. */
export function StaleClosurePuzzle() {
  return (
    <>
      <CodeBlock code={puzzle} highlight={[6]} />
      <p className="hint">
        Start the interval and click the button a few times. The panel shows
        what the interval logs (it also really logs to your browser console).
      </p>
      <IntervalDemo variant="stale" label="deps: [ ]" />
    </>
  )
}

/** Shown in the drawer. */
export function StaleClosureExplanation() {
  return (
    <>
      <p className="tldr">
        <strong>Short answer:</strong> React <em>is</em> updating{' '}
        <code>count</code>, in new renders. The interval callback was created
        in the first render, so it holds that render's <code>count</code>,
        which is <code>0</code>. Because of <code>[]</code>, the effect never
        runs again, so nothing ever replaces that callback. This is a{' '}
        <strong>stale closure</strong>.
      </p>

      <section>
        <h3>Every render has its own count</h3>
        <p>
          This is weirdness #1 again: state is a snapshot. Each render is a
          separate call to <code>Counter</code>, with its own{' '}
          <code>const count</code>. Any function created during that render,
          whether event handlers, effects or interval callbacks, captures{' '}
          <em>that</em> render's value.
        </p>
        <CodeBlock code={closures} />
        <p>
          A normal event handler gets recreated on every render, so it always
          sees a fresh value. The interval callback is different. It was handed
          to <code>setInterval</code> once and is kept alive by the browser.
          It keeps running long after its render is history.
        </p>
      </section>

      <section>
        <h3>Fix 1: add count to the dependencies</h3>
        <p>
          The React Hooks linter tells you to do this. With{' '}
          <code>[count]</code>, every change cleans up the old interval and
          starts a new one that captures the new value.
        </p>
        <CodeBlock code={depsFix} highlight={[6]} />
        <IntervalDemo variant="deps" label="deps: [count]" tone="neutral" />
        <div className="callout">
          <strong>The catch:</strong> the timer restarts on every change. Click
          the button faster than once a second and the interval{' '}
          <em>never fires</em>. Try it above. That's fine for some effects,
          but wrong for a clock or a polling loop.
        </div>
      </section>

      <section>
        <h3>Fix 2: read the latest value from a ref</h3>
        <p>
          A ref is a single object that's the same in every render. Write the
          latest <code>count</code> into it, and read it from the interval.
          The interval itself is created once and never restarts.
        </p>
        <CodeBlock code={refFix} highlight={[3, 8]} />
        <IntervalDemo variant="ref" label="countRef.current" tone="good" />
      </section>

      <section>
        <h3>Fix 3: useEffectEvent</h3>
        <p>
          React has a built-in hook for exactly this situation, available since
          React 19.2. Wrap the code that needs <em>fresh values but shouldn't
          restart the effect</em> in <code>useEffectEvent</code>, and call it
          from inside the effect.
        </p>
        <CodeBlock code={effectEventFix} highlight={[1, 6]} />
        <IntervalDemo variant="effectEvent" label="useEffectEvent" tone="good" />
        <p>
          Effect events are only meant to be called from inside effects. Don't
          pass them to children or call them during render.
        </p>
      </section>

      <section>
        <h3>And if you only need to update state…</h3>
        <p>
          …you don't need to read <code>count</code> at all. Use the updater
          form from weirdness #1:{' '}
          <code>setInterval(() =&gt; setCount(c =&gt; c + 1), 1000)</code>.
          React passes the latest value in, so there's nothing to go stale.
        </p>
      </section>

      <section>
        <h3>Test yourself</h3>
        <Quiz
          question="What does the button show after 5 seconds?"
          code={`useEffect(() => {\n  const id = setInterval(() => {\n    setCount(count + 1);\n  }, 1000);\n  return () => clearInterval(id);\n}, []);`}
          answer="1"
          explanation="Every tick runs setCount(0 + 1), because count is stuck at 0 in this closure. Setting 1 again and again changes nothing after the first tick. The updater form (c => c + 1) fixes it."
        />
        <Quiz
          question="count is 0. You click “Show later”, then click +1 three times within 3 seconds. What does the alert say?"
          code={`<button onClick={() => {\n  setTimeout(() => alert(count), 3000);\n}}>\n  Show later\n</button>`}
          answer="0"
          explanation="Same thing, without any effect involved. The handler belongs to the render where count was 0, and the timeout keeps that closure."
        />
        <Quiz
          question="Using the [count] version, you click +1 every half second for 10 seconds. How many lines get logged?"
          code={`useEffect(() => {\n  const id = setInterval(() => console.log(count), 1000);\n  return () => clearInterval(id);\n}, [count]);`}
          answer="None"
          explanation="Every click changes count, which clears the interval and starts a new one. None of them lives for a full second."
        />
      </section>

      <section>
        <h3>Takeaways</h3>
        <ul className="takeaways">
          <li>Functions capture the values from the render that created them. Long-lived callbacks (intervals, timeouts, subscriptions) keep those values long after.</li>
          <li><code>[]</code> means the effect, and every closure inside it, is from the first render only.</li>
          <li>Adding the dependency is correct, but it restarts the effect each time. Sometimes that's exactly what you don't want.</li>
          <li>To read the latest values without restarting, use <code>useEffectEvent</code> (or a ref). To update state, use the updater form.</li>
        </ul>
      </section>
    </>
  )
}
