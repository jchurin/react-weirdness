import CodeBlock from '../../components/CodeBlock'
import Quiz from '../../components/Quiz'
import { ListDemo } from './demos'

const puzzle = `
function TodoList() {
  const [todos, setTodos] = useState(initialTodos);

  const addToTop = () =>
    setTodos([{ id: crypto.randomUUID(), text: 'Call mom' }, ...todos]);

  return (
    <ul>
      {todos.map((todo, index) => (
        <TodoItem key={index} text={todo.text} />
      ))}
    </ul>
  );
}

function TodoItem({ text }) {
  const [done, setDone] = useState(false);
  const [note, setNote] = useState('');
  return (
    <li>
      <input type="checkbox" checked={done} onChange={...} />
      {text}
      <input value={note} onChange={...} />
    </li>
  );
}
`

const fix = `
{todos.map(todo => (
  <TodoItem key={todo.id} text={todo.text} />
))}
`

const goodIds = `
// ✅ An id that comes with the data (database id, slug, ...)
<Row key={user.id} />

// ✅ Created once, when the item is created (in an event handler)
const add = (text) =>
  setTodos([...todos, { id: crypto.randomUUID(), text }]);

// ❌ Created during render: a new key every render = remount every render
<Row key={crypto.randomUUID()} />
<Row key={Math.random()} />

// ⚠️ Only if it's truly unique and never changes
<Row key={todo.text} />
`

/** Shown on the page: the code and the live demo. */
export function IndexKeysPuzzle() {
  return (
    <>
      <CodeBlock code={puzzle} highlight={[10]} />
      <p className="hint">
        Tick <strong>Buy milk</strong> and write a note on it, then click{' '}
        <strong>Add to top</strong>. Try <strong>Remove first</strong> and{' '}
        <strong>Reverse</strong> too.
      </p>
      <ListDemo keyBy="index" label="key={index}" tone="neutral" />
    </>
  )
}

/** Shown in the drawer. */
export function IndexKeysExplanation() {
  return (
    <>
      <p className="tldr">
        <strong>Short answer:</strong> a key tells React <em>which item is
        which</em> between renders. An index only says <em>where</em> it is.
        When items move, the index keys stay in place, so each row's state
        stays in place too while the text moves past it.
      </p>

      <section>
        <h3>What React sees</h3>
        <p>
          React matches the old rows to the new rows by key. With index keys,
          adding "Call mom" to the top looks like this:
        </p>
        <table className="queue-table">
          <thead>
            <tr><th>key</th><th>Before</th><th>After</th><th>React's conclusion</th></tr>
          </thead>
          <tbody>
            <tr><td><code>0</code></td><td>Buy milk ✓</td><td>Call mom</td><td>same row, new text. Keep ✓</td></tr>
            <tr><td><code>1</code></td><td>Walk the dog</td><td>Buy milk</td><td>same row, new text</td></tr>
            <tr><td><code>2</code></td><td>Write code</td><td>Walk the dog</td><td>same row, new text</td></tr>
            <tr><td><code>3</code></td><td>—</td><td>Write code</td><td>new row! Mount it</td></tr>
          </tbody>
        </table>
        <p>
          React never sees an insert at the top. It sees three rows whose text
          changed and a new row at the bottom. The <code>done</code> and{' '}
          <code>note</code> state stays with key <code>0</code>, so it now
          belongs to "Call mom". In the demo, the flash and the new instance
          tag show up on the <strong>last</strong> row, even though you
          added to the top.
        </p>
      </section>

      <section>
        <h3>Compare: index keys vs real ids</h3>
        <p>Do the same steps on both lists:</p>
        <ListDemo keyBy="index" label="key={index}" tone="bad" />
        <ListDemo keyBy="id" label="key={todo.id}" tone="good" />
        <CodeBlock code={fix} highlight={[2]} />
        <p>
          With ids, each row keeps its key wherever it goes. React{' '}
          <em>moves</em> the existing rows, with their state and DOM, and
          only mounts the one that's actually new, at the top.
        </p>
      </section>

      <section>
        <h3>What goes wrong with index keys</h3>
        <ul className="takeaways">
          <li><strong>State ends up on the wrong item:</strong> checkboxes, notes, "expanded" toggles, anything in <code>useState</code> inside the row.</li>
          <li><strong>The DOM does too:</strong> uncontrolled inputs, focus, scroll position and running animations stay at the position, even with no React state at all.</li>
          <li><strong>Extra work:</strong> inserting at the top re-renders every row with new props and mounts one at the end, instead of mounting one row and leaving the rest alone.</li>
        </ul>
        <div className="callout">
          <strong>Same rule as weirdness #2.</strong> A key is a component's
          identity. A changed key gives you a new component, and a reused key
          gives you the old component with all its state, even if it now
          shows a different item.
        </div>
      </section>

      <section>
        <h3>So is <code>key={'{'}index{'}'}</code> ever OK?</h3>
        <p>
          Yes, when all of these are true: the list is never reordered,
          filtered or sorted, items are only ever added at the end, and rows
          have no state of their own. A static list of links is fine. A
          to-do list is not. When in doubt, use an id.
        </p>
      </section>

      <section>
        <h3>Where good keys come from</h3>
        <CodeBlock code={goodIds} />
      </section>

      <section>
        <h3>Test yourself</h3>
        <Quiz
          question="Index keys. “Buy milk” (first row) is ticked. You click Remove first. What do you see?"
          code={`// before: [Buy milk ✓, Walk the dog, Write code]\nsetTodos(todos.slice(1));`}
          answer="“Walk the dog” is now ticked"
          explanation="Key 0 survives with its done = true and now gets the text “Walk the dog”. The component that was destroyed is key 2, the last row."
        />
        <Quiz
          question="Items are only ever appended to the end, never removed or reordered. Is key={index} a problem here?"
          code={`setTodos([...todos, newTodo]);`}
          answer="No"
          explanation="Every existing item keeps its index, so keys keep pointing at the same items. It stops being safe the moment you add sorting, deleting or inserting anywhere else."
        />
        <Quiz
          question="What happens to the notes typed in each row whenever TodoList re-renders?"
          code={`{todos.map(todo => (\n  <TodoItem key={Math.random()} text={todo.text} />\n))}`}
          answer="They're wiped"
          explanation="Every render produces new keys, so React unmounts and remounts every row each time. That's worse than index keys."
        />
      </section>

      <section>
        <h3>Takeaways</h3>
        <ul className="takeaways">
          <li>Keys connect rows to items. Index keys connect rows to positions.</li>
          <li>With index keys, inserting, removing or reordering leaves state and DOM behind on the wrong item.</li>
          <li>Use a stable, unique id from your data, or create one when the item is created, never during render.</li>
          <li>Index keys are only safe for static or append-only lists with stateless rows.</li>
        </ul>
      </section>
    </>
  )
}
