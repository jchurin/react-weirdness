import CodeBlock from '../../components/CodeBlock'
import Quiz from '../../components/Quiz'
import { ProfileDemo } from './demos'

const puzzle = `
function App() {
  const [id, setId] = useState(1);

  return (
    <>
      <button onClick={() => setId(id + 1)}>
        Change ID
      </button>
      <Profile key={id} />
    </>
  );
}

function Profile() {
  const [note, setNote] = useState('');
  return (
    <>
      <textarea value={note} onChange={e => setNote(e.target.value)} />
      <LikeButton />
    </>
  );
}

function LikeButton() {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(likes + 1)}>♥ {likes}</button>;
}
`

const identity = `
// Render 1                       // Render 2
<Profile key={1} />               <Profile key={2} />

// Same type, same position... but a different key.
// React's verdict: "that's a different Profile."
//   → unmount Profile#1 and everything under it
//   → mount a brand-new Profile#2 from scratch
`

const noKey = `
// No key: React sees the same Profile in the same spot,
// so it keeps the instance and just passes new props.
<Profile userId={id} />
`

const resetPattern = `
// ❌ Resetting state by hand when a prop changes
function EditProfile({ userId }) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    setDraft('');          // extra render, easy to forget a field
  }, [userId]);
  ...
}

// ✅ Let React do it: a new user means a new component
<EditProfile key={userId} userId={userId} />
`

const keyQuestion = 'Does Counter keep its state when the condition flips?'

/** Shown on the page: the code and the live demo. */
export function KeyResetPuzzle() {
  return (
    <>
      <CodeBlock code={puzzle} highlight={[9]} />
      <p className="hint">
        Write a note, like a few times, then hit <strong>Change ID</strong>.
      </p>
      <ProfileDemo withKey label="<Profile key={id} />" tone="neutral" />
    </>
  )
}

/** Shown in the drawer. */
export function KeyResetExplanation() {
  return (
    <>
      <p className="tldr">
        <strong>Short answer:</strong> yes. React treats an element with a new{' '}
        <code>key</code> as a different component. It unmounts the old{' '}
        <code>Profile</code> and <strong>its whole subtree</strong>, including{' '}
        <code>LikeButton</code>, then mounts fresh ones. All their state is
        gone.
      </p>

      <section>
        <h3>How React decides what to keep</h3>
        <p>
          On every render, React compares the new tree with the previous one.
          For each spot in the tree it asks:{' '}
          <em>is this the same component as last time?</em> That depends on
          three things: the <strong>type</strong> (<code>Profile</code>), the{' '}
          <strong>position</strong> in its parent, and the{' '}
          <strong>key</strong>.
        </p>
        <p>
          If all three match, React keeps the instance and its state, and only
          passes new props. If any one of them differs, React throws the old
          instance away and builds a new one.
        </p>
        <CodeBlock code={identity} />
        <p>
          Keys are best known from lists, but they work on any element. They
          are how you tell React who a component is.
        </p>
      </section>

      <section>
        <h3>What about the children?</h3>
        <p>
          State lives in React's tree, attached to each component's position.
          When <code>Profile</code> unmounts, everything below it in the tree
          unmounts too. <code>LikeButton</code> doesn't need a key of its own.
          Its parent was replaced, so it gets replaced as well.
        </p>
        <p>A key change resets the whole subtree:</p>
        <ul className="takeaways">
          <li><strong>State:</strong> every <code>useState</code> / <code>useReducer</code> goes back to its initial value.</li>
          <li><strong>Refs:</strong> <code>useRef</code> values start over.</li>
          <li><strong>Effects:</strong> cleanups run for the old instances, and effects run again for the new ones. Data fetching runs again, for example.</li>
          <li><strong>DOM:</strong> nodes are removed and recreated. Focus, scroll position and CSS animations reset. That's why the cards flash in the demo.</li>
        </ul>
        <p>
          Things that live outside the subtree are <em>not</em> reset: the
          parent's state, context values, external stores and caches.
        </p>
      </section>

      <section>
        <h3>Compare: the same thing without a key</h3>
        <CodeBlock code={noKey} />
        <ProfileDemo withKey={false} label="<Profile userId={id} />" tone="bad" />
        <p>
          Write a note and change the ID. The instance tags stay the same, and
          your note for user #1 is <strong>still there for user #2</strong>.
          This is a classic bug in edit forms and chat inputs, and adding a key
          fixes it.
        </p>
      </section>

      <section>
        <h3>Use it on purpose</h3>
        <p>
          Changing the key is the simplest way to reset a component when its
          identity changes. It's usually better than resetting state in an
          effect:
        </p>
        <CodeBlock code={resetPattern} />
        <div className="callout">
          <strong>Watch the cost.</strong> A remount recreates the DOM and
          runs effects again for the whole subtree. Never use an unstable key
          such as <code>key={'{'}Math.random(){'}'}</code>. It remounts on
          every render, so inputs lose focus while you type.
        </div>
      </section>

      <section>
        <h3>Test yourself</h3>
        <Quiz
          question={keyQuestion}
          code={`{isAdmin ? <Counter key="admin" /> : <Counter key="user" />}`}
          answer="No"
          explanation="Different keys, so they are different components. Flipping the condition unmounts one and mounts the other."
        />
        <Quiz
          question={keyQuestion}
          code={`{isAdmin ? <Counter /> : <Counter />}`}
          answer="Yes"
          explanation="Same type, same position, no key. React can't tell them apart, so it reuses the instance. Add keys if you want them separate."
        />
        <Quiz
          question={keyQuestion}
          code={`<div>\n  {showBanner && <Banner />}\n  <Counter />\n</div>`}
          answer="Yes"
          explanation="When showBanner is false, {false} still holds the first slot, so Counter stays in the second slot and keeps its state."
        />
      </section>

      <section>
        <h3>Takeaways</h3>
        <ul className="takeaways">
          <li>A component's identity is its type, its position and its key. Change any of them and you get a new instance.</li>
          <li>A new key resets the entire subtree: state, refs, effects and DOM.</li>
          <li><code>key={'{'}id{'}'}</code> is the simplest way to reset a component when what it represents changes.</li>
          <li>Keys must be stable. A key that changes every render remounts every render.</li>
        </ul>
      </section>
    </>
  )
}
