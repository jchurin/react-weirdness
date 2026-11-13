import CodeBlock from '../../components/CodeBlock'
import Quiz from '../../components/Quiz'
import { CycleStepper, EmptyDepsDemo, NoDepsDemo } from './demos'

const puzzle = `
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(c => c + 1);
  });

  return <div>{count}</div>;
}
`

const withEmptyDeps = `
useEffect(() => {
  setCount(c => c + 1);
}, []);
`

const depsCheatSheet = `
useEffect(fn);          // after EVERY render
useEffect(fn, []);      // after the first render only (mount)
useEffect(fn, [a, b]);  // after renders where a or b changed
                        // (compared with Object.is)
`

const betterFixes = `
// "I want count to start at 1"
const [count, setCount] = useState(1);

// "I want a value calculated from state"
const doubled = count * 2;              // just compute it during render

// "I want to react to a user action"
<button onClick={() => setCount(c => c + 1)}>   // do it in the handler

// "I need to sync with something outside React"
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);       // cleanup makes it safe to run twice
}, []);
`

/** Shown on the page: the code and the live demos. */
export function EffectLoopPuzzle() {
  return (
    <>
      <CodeBlock code={puzzle} highlight={[4, 5, 6]} />
      <p className="hint">
        Don't worry, this demo has a safety brake so it won't freeze your tab.
      </p>
      <NoDepsDemo />

      <h2 className="puzzle-subhead">And with an empty dependency array?</h2>
      <CodeBlock code={withEmptyDeps} highlight={[3]} />
      <p className="hint">The effect adds 1 once. So you should see 1… right?</p>
      <EmptyDepsDemo />
    </>
  )
}

/** Shown in the drawer. */
export function EffectLoopExplanation() {
  return (
    <>
      <p className="tldr">
        <strong>Short answer:</strong> an effect with no dependency array runs
        after <em>every</em> render. This one sets state, which causes a
        render, which runs the effect again, and so on forever. Adding{' '}
        <code>[]</code> does stop the loop, but in development you'll see{' '}
        <strong>2</strong>, not 1, and it's often the wrong fix anyway.
      </p>

      <section>
        <h3>The loop, in slow motion</h3>
        <p>
          Switch between the two versions to see where the cycle breaks:
        </p>
        <CycleStepper />
        <p>
          Setting state from an effect isn't instant. React finishes the
          render, updates the screen, runs effects, and <em>then</em> processes
          the new state with another render. Without a dependency array,
          nothing ever tells React to skip the effect.
        </p>
        <CodeBlock code={depsCheatSheet} />
      </section>

      <section>
        <h3>So does <code>[]</code> fix it?</h3>
        <p>
          It fixes the <em>loop</em>. With <code>[]</code> the deps never
          change, so after the first run React always skips the effect. But
          there are two catches.
        </p>

        <h3>Catch 1: you see 2, not 1</h3>
        <EmptyDepsDemo tone="bad" />
        <p>
          In development, <code>&lt;StrictMode&gt;</code> mounts every
          component, unmounts it, and mounts it again right away to check that
          your effects clean up after themselves. So the effect runs twice on
          mount, and two <code>c =&gt; c + 1</code> updates are queued. In a
          production build you'd see 1.
        </p>
        <div className="callout">
          <strong>This is a feature.</strong> If running your effect twice
          breaks your app, it will also break in production when a user
          navigates away and back. Effects should be safe to run more than
          once, usually by returning a cleanup function.
        </div>

        <h3>Catch 2: it usually hides a design problem</h3>
        <p>
          An effect that only sets state from other state rarely needs to
          exist. Effects are for syncing with things <em>outside</em> React,
          such as timers, subscriptions, network requests or the DOM. Most of
          the time there's a simpler way:
        </p>
        <CodeBlock code={betterFixes} />
      </section>

      <section>
        <h3>Dependencies can loop too</h3>
        <p>
          Adding dependencies doesn't guarantee safety. If the effect changes
          one of its own dependencies, or a dependency is a new object every
          render, you're back in the loop:
        </p>
        <Quiz
          question="Does this stop?"
          code={`useEffect(() => {\n  setCount(count + 1);\n}, [count]);`}
          answer="No, it loops forever"
          explanation="The effect changes count, count is a dependency, so the effect runs again. Same loop, just with extra steps."
        />
        <Quiz
          question="Does this stop?"
          code={`const filters = { status: 'open' };\n\nuseEffect(() => {\n  fetchTodos(filters).then(setTodos);\n}, [filters]);`}
          answer="No, it loops forever"
          explanation="filters is a new object on every render, and Object.is compares by reference, so the deps always “changed”. setTodos causes a render, which creates a new filters object, and so on. Fix it by moving the object inside the effect or depending on filters.status."
        />
        <Quiz
          question="What does count end at?"
          code={`useEffect(() => {\n  if (count < 5) setCount(c => c + 1);\n});`}
          answer="5"
          explanation="No dependency array, so it runs after every render, but the condition stops it. That's 5 extra renders just to reach a number you could have started with."
        />
      </section>

      <section>
        <h3>Your linter knows</h3>
        <p>
          The React Hooks lint rules (in ESLint, or oxlint in this project) flag
          both versions of the puzzle. They warn about an effect with no deps
          that sets state, and about setting state synchronously inside an
          effect. In development, React may also log a{' '}
          <em>"Maximum update depth exceeded"</em> warning in the console while
          the loop runs. Don't ignore either one.
        </p>
      </section>

      <section>
        <h3>Takeaways</h3>
        <ul className="takeaways">
          <li>No dependency array means the effect runs after every render. Setting state in it means a render loop.</li>
          <li><code>[]</code> stops the loop, but StrictMode will run it twice in development, on purpose.</li>
          <li>An effect that changes its own dependency, or depends on an object created during render, loops too.</li>
          <li>Before setting state in an effect, ask whether you could compute it during render, set it in an event handler, or use it as the initial state.</li>
        </ul>
      </section>
    </>
  )
}
