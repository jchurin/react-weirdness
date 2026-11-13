import CodeBlock from '../../components/CodeBlock'
import Quiz from '../../components/Quiz'
import { FormDemo } from './demos'

const puzzle = `
function SignupForm() {
  const [email, setEmail] = useState('');

  function EmailInput() {
    return <input value={email} onChange={e => setEmail(e.target.value)} />;
  }

  return (
    <form>
      <EmailInput />
      <p>You typed: {email}</p>
    </form>
  );
}
`

const whatReactSees = `
// Render 1                          // Render 2 (after one keystroke)
function EmailInput() {...}  // A    function EmailInput() {...}  // B

<EmailInput />  // type: A           <EmailInput />  // type: B

// Same name, same code... but A !== B.
// Different type → unmount A (and its <input>), mount B from scratch.
`

const fix = `
// ✅ Declare components at the top level, pass data in as props
function EmailInput({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

function SignupForm() {
  const [email, setEmail] = useState('');
  return (
    <form>
      <EmailInput value={email} onChange={setEmail} />
      <p>You typed: {email}</p>
    </form>
  );
}
`

const alternatives = `
// ✅ Or just inline the JSX, it doesn't need to be a component
<form>
  <input value={email} onChange={e => setEmail(e.target.value)} />
</form>

// ⚠️ Or call a render helper as a function. Not a component, so no new type.
// (It can't have its own hooks, though: they'd belong to SignupForm.)
const renderEmailInput = () => <input value={email} ... />;
<form>{renderEmailInput()}</form>
`

/** Shown on the page: the code and the live demo. */
export function InnerComponentPuzzle() {
  return (
    <>
      <CodeBlock code={puzzle} highlight={[4, 5, 6]} />
      <p className="hint">Click the input and try to type your email.</p>
      <FormDemo />
    </>
  )
}

/** Shown in the drawer. */
export function InnerComponentExplanation() {
  return (
    <>
      <p className="tldr">
        <strong>Short answer:</strong> <code>EmailInput</code> is declared
        inside <code>SignupForm</code>, so every render creates a{' '}
        <em>brand-new</em> <code>EmailInput</code> function. To React that's a
        different component type, so it throws away the old{' '}
        <code>&lt;input&gt;</code> and mounts a new one, which doesn't have
        focus. That happens on every keystroke.
      </p>

      <section>
        <h3>A new function is a new component</h3>
        <p>
          Remember weirdness #2: React decides whether a component is "the
          same one" by its <strong>type</strong>, position and key. The type
          is the function itself, compared by reference.
        </p>
        <CodeBlock code={whatReactSees} />
        <p>
          Typing calls <code>setEmail</code>, <code>SignupForm</code>{' '}
          re-renders, a new <code>EmailInput</code> function is created, and
          React sees a different component in that spot. The instance tag in
          the demo changes and the card flashes on every keystroke. Each time,
          a new input element replaces the old one.
        </p>
      </section>

      <section>
        <h3>What gets lost</h3>
        <ul className="takeaways">
          <li><strong>Focus and cursor position:</strong> the old input is gone, so focus goes with it.</li>
          <li><strong>State inside the inner component:</strong> any <code>useState</code> in <code>EmailInput</code> resets on every parent render.</li>
          <li><strong>Performance:</strong> React rebuilds the whole subtree from scratch instead of updating it, and effects run again each time.</li>
        </ul>
        <div className="callout">
          <strong>The value survives, which makes it confusing.</strong>{' '}
          <code>email</code> lives in <code>SignupForm</code>, which is never
          remounted, so the text looks right. Only the things that belong to
          the inner component and its DOM get lost.
        </div>
      </section>

      <section>
        <h3>The fix: declare components at the top level</h3>
        <CodeBlock code={fix} highlight={[2]} />
        <FormDemo fixed tone="good" />
        <p>
          Now <code>EmailInput</code> is one function, created once when the
          module loads. The type matches on every render, so React updates
          the existing input instead of replacing it.
        </p>
        <CodeBlock code={alternatives} />
      </section>

      <section>
        <h3>Test yourself</h3>
        <Quiz
          question="Tab has its own counter. What happens to it when Page re-renders for any reason?"
          code={`function Page() {\n  const [theme, setTheme] = useState('dark');\n\n  function Tab() {\n    const [clicks, setClicks] = useState(0);\n    return <button onClick={() => setClicks(clicks + 1)}>{clicks}</button>;\n  }\n\n  return <Tab />;\n}`}
          answer="It resets to 0"
          explanation="Each Page render creates a new Tab type, so React mounts a fresh Tab with fresh state. Clicking Tab is fine, because that only re-renders Tab. It breaks whenever Page renders."
        />
        <Quiz
          question="Does wrapping the inner component in memo fix it?"
          code={`function SignupForm() {\n  const [email, setEmail] = useState('');\n  const EmailInput = memo(() => <input value={email} ... />);\n  return <EmailInput />;\n}`}
          answer="No"
          explanation="memo() returns a new component type each time it's called, and it's called on every render. You've just made a new memoized type every render."
        />
        <Quiz
          question="Does this version keep focus while you type?"
          code={`function SignupForm() {\n  const [email, setEmail] = useState('');\n  const renderInput = () => (\n    <input value={email} onChange={e => setEmail(e.target.value)} />\n  );\n  return <form>{renderInput()}</form>;\n}`}
          answer="Yes"
          explanation="renderInput() is called as a function, not used as <RenderInput />. It just returns an <input> element. Its type is 'input' every time, so React keeps the same DOM node."
        />
      </section>

      <section>
        <h3>Takeaways</h3>
        <ul className="takeaways">
          <li>A component's type is the function itself, compared by reference. A function declared inside another component is a new type on every render.</li>
          <li>A new type means unmount and remount: lost focus, lost state, wasted work.</li>
          <li>Declare components at the top level of a module and pass data through props.</li>
          <li>Linters catch this: the React Hooks <code>static-components</code> rule (oxlint and the React Compiler lint) and <code>react/no-unstable-nested-components</code> (eslint-plugin-react).</li>
        </ul>
      </section>
    </>
  )
}
