import CodeBlock from '../../components/CodeBlock'
import Quiz from '../../components/Quiz'
import { RaceDemo } from './demos'

const puzzle = `
function Profile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <h1>{user?.name}</h1>;
}
`

const timeline = `
0.0s  click Alice  → effect runs → request Alice   (slow: 3.0s)
0.5s  click Bob    → effect runs → request Bob     (fast: 0.6s)
1.1s  ← Bob arrives    → setUser(Bob)     ✓ correct
3.0s  ← Alice arrives  → setUser(Alice)   ✗ but Bob is selected!
`

const ignoreFix = `
useEffect(() => {
  let ignore = false;

  fetchUser(userId).then(user => {
    if (!ignore) setUser(user);
  });

  return () => {
    ignore = true;   // runs before the next effect, and on unmount
  };
}, [userId]);
`

const abortFix = `
useEffect(() => {
  const controller = new AbortController();

  fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
    .then(res => res.json())
    .then(setUser)
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });

  return () => controller.abort();   // actually cancels the request
}, [userId]);
`

/** Shown on the page: the code and the live demo. */
export function FetchRacePuzzle() {
  return (
    <>
      <CodeBlock code={puzzle} highlight={[4, 5, 6]} />
      <p className="hint">
        Alice's server is slow (3 s), Bob's is fast. Click <strong>Alice</strong>,
        then quickly click <strong>Bob</strong>, and wait a few seconds.
      </p>
      <RaceDemo strategy="none" />
    </>
  )
}

/** Shown in the drawer. */
export function FetchRaceExplanation() {
  return (
    <>
      <p className="tldr">
        <strong>Short answer:</strong> every <code>userId</code> change starts
        a new request, but nothing stops the old ones. Responses arrive in
        whatever order the network delivers them, and the{' '}
        <em>last one to arrive</em> wins, not the last one you asked for. This
        is a <strong>race condition</strong>.
      </p>

      <section>
        <h3>What happened, step by step</h3>
        <CodeBlock code={timeline} highlight={[4]} />
        <p>
          Both requests were started correctly, and both <code>.then</code>{' '}
          callbacks did exactly what they were told. The problem is that the
          Alice callback is still alive after you moved on to Bob, and it has
          no way to know that.
        </p>
        <p>
          This isn't a stale closure (weirdness #6). <code>setUser</code>{' '}
          works fine. It's about <em>timing</em>: async work started by an old
          render finishing after a newer one.
        </p>
      </section>

      <section>
        <h3>Fix 1: ignore stale responses in the cleanup</h3>
        <p>
          React runs an effect's cleanup before running it again with new
          deps, and when the component unmounts. Use it to mark the old
          request as outdated:
        </p>
        <CodeBlock code={ignoreFix} highlight={[2, 5, 9]} />
        <RaceDemo strategy="ignore" tone="good" />
        <p>
          Each effect run has its own <code>ignore</code> variable. When you
          click Bob, React runs Alice's cleanup, which sets{' '}
          <em>Alice's</em> <code>ignore</code> to <code>true</code>. Her
          response still arrives, but it's dropped.
        </p>
      </section>

      <section>
        <h3>Fix 2: abort the request</h3>
        <p>
          With real <code>fetch</code> you can go further and cancel the
          request with an <code>AbortController</code>. This saves bandwidth
          and server work too:
        </p>
        <CodeBlock code={abortFix} highlight={[2, 4, 11]} />
        <RaceDemo strategy="abort" tone="good" />
      </section>

      <section>
        <h3>In a real app</h3>
        <div className="callout">
          Writing fetch effects by hand means handling races, loading and
          error states, caching and retries yourself. Data libraries such as{' '}
          <strong>TanStack Query</strong> or <strong>SWR</strong>, or your
          framework's data loading, handle the race for you. The cleanup
          pattern is still worth knowing for any async work in an effect,
          like timers, subscriptions or WebSockets.
        </div>
        <p>
          Bonus: in development, StrictMode runs effects twice on mount
          (weirdness #4), so a fetch effect fires two requests. With the
          cleanup in place, the first one is ignored or aborted, so this is
          the same problem in miniature.
        </p>
      </section>

      <section>
        <h3>Test yourself</h3>
        <Quiz
          question="No cleanup. You click Alice (3 s), then Bob (0.6 s), then Alice again, all within half a second. Which profile ends up on screen?"
          code={`useEffect(() => {\n  fetchUser(userId).then(setUser);\n}, [userId]);`}
          answer="Alice, but by luck"
          explanation="Bob arrives first, then Alice #1, then Alice #2. The last arrival happens to match the selection, so the bug hides. That's why races are so hard to catch in testing."
        />
        <Quiz
          question="With the ignore flag, the component unmounts while a request is still pending. What happens when the response arrives?"
          code={`useEffect(() => {\n  let ignore = false;\n  fetchUser(userId).then(u => { if (!ignore) setUser(u); });\n  return () => { ignore = true; };\n}, [userId]);`}
          answer="Nothing"
          explanation="Cleanup also runs on unmount, so ignore is true and setUser is never called. That's exactly what you want."
        />
        <Quiz
          question="Why can't you write the effect like this?"
          code={`useEffect(async () => {\n  const user = await fetchUser(userId);\n  setUser(user);\n}, [userId]);`}
          answer="An async function returns a Promise"
          explanation="React expects an effect to return a cleanup function or nothing. An async function always returns a Promise, so React warns and there's nowhere to put the cleanup. Define an async function inside the effect and call it."
        />
      </section>

      <section>
        <h3>Takeaways</h3>
        <ul className="takeaways">
          <li>Async responses arrive in any order. Without cleanup, the last to arrive wins, not the last requested.</li>
          <li>An effect's cleanup runs before the next run and on unmount. Use it to ignore or abort outdated work.</li>
          <li>An <code>ignore</code> flag works for any promise. <code>AbortController</code> also cancels the request itself.</li>
          <li>For real data fetching, prefer a data library or your framework's loaders.</li>
        </ul>
      </section>
    </>
  )
}
