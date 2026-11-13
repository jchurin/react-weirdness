import { useRef, useState } from 'react'
import { useInstanceTag } from '../../components/useInstanceTag'

interface Todo {
  id: number
  text: string
}

const initialTodos: Todo[] = [
  { id: 1, text: 'Buy milk' },
  { id: 2, text: 'Walk the dog' },
  { id: 3, text: 'Write code' },
]

const newItemPool = ['Call mom', 'Read a book', 'Water the plants', 'Fix the bike', 'Learn React', 'Go running']

function TodoItem({ text, keyLabel }: { text: string; keyLabel: string }) {
  const [done, setDone] = useState(false)
  const [note, setNote] = useState('')
  const { id } = useInstanceTag()

  return (
    <li className="todo-row mount-flash">
      <span className="key-chip">key={keyLabel}</span>
      <label className="todo-main">
        <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} />
        <span className={done ? 'todo-text done' : 'todo-text'}>{text}</span>
      </label>
      <input
        className="todo-note"
        placeholder="note…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <span className="instance-chip" title="Component instance">
        <strong>{id}</strong>
      </span>
    </li>
  )
}

interface ListDemoProps {
  keyBy: 'index' | 'id'
  label: string
  tone: 'bad' | 'good' | 'neutral'
}

export function ListDemo({ keyBy, label, tone }: ListDemoProps) {
  const [todos, setTodos] = useState(initialTodos)
  // Ids are created in event handlers, never during render
  const nextId = useRef(initialTodos.length + 1)

  const addToTop = () => {
    const id = nextId.current++
    const text = newItemPool[(id - initialTodos.length - 1) % newItemPool.length]
    setTodos([{ id, text }, ...todos])
  }
  const removeFirst = () => setTodos(todos.slice(1))
  const reverse = () => setTodos([...todos].reverse())

  return (
    <div className={`demo demo-${tone}`}>
      <div className="demo-head">
        <span className="demo-label">{label}</span>
        <button
          className="link-btn"
          onClick={() => {
            setTodos(initialTodos)
            nextId.current = initialTodos.length + 1
          }}
        >
          reset
        </button>
      </div>
      <div className="demo-stack">
        <div className="list-controls">
          <button className="secondary-btn" onClick={addToTop}>Add to top</button>
          <button className="secondary-btn" onClick={removeFirst} disabled={!todos.length}>Remove first</button>
          <button className="secondary-btn" onClick={reverse}>Reverse</button>
        </div>
        <ul className="todo-list">
          {todos.map((todo, index) => {
            const key = keyBy === 'index' ? index : todo.id
            return <TodoItem key={key} keyLabel={String(key)} text={todo.text} />
          })}
        </ul>
      </div>
    </div>
  )
}
