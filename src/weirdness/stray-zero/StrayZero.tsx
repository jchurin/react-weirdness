import CodeBlock from '../../components/CodeBlock'
import Quiz from '../../components/Quiz'
import { CartDemo } from './demos'

const puzzle = `
function Cart({ items }) {
  return (
    <div>
      <h2>Your cart</h2>
      {items.length && <ItemList items={items} />}
    </div>
  );
}
`

const howAndWorks = `
// a && b  →  if a is falsy, the result is a itself (not false!)
2 && <ItemList />      // → <ItemList />
0 && <ItemList />      // → 0
`

const fixes = `
// ✅ Make the left side a real boolean
{items.length > 0 && <ItemList items={items} />}
{!!items.length && <ItemList items={items} />}

// ✅ Or use a ternary with an explicit "nothing"
{items.length ? <ItemList items={items} /> : null}
`

/** Shown on the page: the code and the live demo. */
export function StrayZeroPuzzle() {
  return (
    <>
      <CodeBlock code={puzzle} highlight={[5]} />
      <p className="hint">
        Remove items until the cart is empty, and look right under "Your cart".
      </p>
      <CartDemo />
    </>
  )
}

/** Shown in the drawer. */
export function StrayZeroExplanation() {
  return (
    <>
      <p className="tldr">
        <strong>Short answer:</strong> <code>&&</code> doesn't return{' '}
        <code>false</code>. It returns its left side when that's falsy. With
        an empty cart, <code>items.length && …</code> evaluates to{' '}
        <code>0</code>, and React renders numbers, <code>0</code> included.
      </p>

      <section>
        <h3>It's JavaScript, not React</h3>
        <p>
          <code>&&</code> short-circuits: if the left side is falsy, it stops
          and returns <em>that value</em>. It doesn't turn it into{' '}
          <code>false</code>.
        </p>
        <CodeBlock code={howAndWorks} highlight={[4]} />
        <p>
          So JSX receives a plain <code>0</code> as a child. React's job is to
          render children, and <code>0</code> is a perfectly valid number to
          render.
        </p>
      </section>

      <section>
        <h3>What React does with each value</h3>
        <table className="queue-table">
          <thead>
            <tr><th>Child value</th><th>Rendered</th></tr>
          </thead>
          <tbody>
            <tr><td><code>false</code>, <code>true</code>, <code>null</code>, <code>undefined</code></td><td>nothing</td></tr>
            <tr><td><code>''</code> (empty string)</td><td>nothing visible</td></tr>
            <tr><td><code>0</code>, <code>-0</code></td><td><strong>"0"</strong> ⚠️</td></tr>
            <tr><td><code>NaN</code></td><td><strong>"NaN"</strong> ⚠️</td></tr>
            <tr><td><code>[]</code></td><td>nothing</td></tr>
            <tr><td><code>{'{ }'}</code> (a plain object)</td><td>💥 crash: "Objects are not valid as a React child"</td></tr>
          </tbody>
        </table>
        <p>
          Booleans, <code>null</code> and <code>undefined</code> are skipped
          on purpose so that <code>&&</code> and ternaries work in JSX.
          Numbers are always rendered, because a <code>0</code> is often
          exactly what you want to show, like "0 unread messages".
        </p>
        <div className="callout">
          <strong>On React Native it's worse:</strong> a stray{' '}
          <code>0</code> outside a <code>&lt;Text&gt;</code> crashes the app
          with "Text strings must be rendered within a &lt;Text&gt;
          component".
        </div>
      </section>

      <section>
        <h3>The fix</h3>
        <p>Make sure the left side of <code>&&</code> is a real boolean:</p>
        <CodeBlock code={fixes} />
        <CartDemo fixed tone="good" />
      </section>

      <section>
        <h3>Test yourself</h3>
        <Quiz
          question="unreadCount is 0. What appears next to the bell?"
          code={`<Bell />\n{user.unreadCount && <Badge count={user.unreadCount} />}`}
          answer="A 0"
          explanation="Same trap. And it looks almost intentional, which makes it easy to miss in review."
        />
        <Quiz
          question="name is '' (empty string). What renders?"
          code={`{name && <Greeting name={name} />}`}
          answer="Nothing visible"
          explanation="&& returns '', and React renders an empty text node, which you can't see. It's harmless here, but it's the same mechanism."
        />
        <Quiz
          question="score and total are both 0. What renders?"
          code={`{score / total && <Progress value={score / total} />}`}
          answer="NaN"
          explanation="0 / 0 is NaN, which is falsy, so && returns it, and React renders it as the text “NaN”."
        />
      </section>

      <section>
        <h3>Takeaways</h3>
        <ul className="takeaways">
          <li><code>a && b</code> returns <code>a</code> when it's falsy, not <code>false</code>.</li>
          <li>React skips booleans, <code>null</code> and <code>undefined</code>, but renders numbers, including <code>0</code> and <code>NaN</code>.</li>
          <li>Put a real boolean on the left: <code>count &gt; 0 &&</code>, <code>!!count &&</code>, or use a ternary.</li>
        </ul>
      </section>
    </>
  )
}
