import { useState } from 'react'

const pool = ['🍎 Apple', '🥖 Bread', '🧀 Cheese', '🥛 Milk', '🍫 Chocolate']

function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="cart-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

function Cart({ items, fixed }: { items: string[]; fixed: boolean }) {
  return (
    <div className="render-box">
      <span className="render-box-label">rendered output</span>
      <h4 className="cart-title">Your cart</h4>
      {fixed ? items.length > 0 && <ItemList items={items} /> : items.length && <ItemList items={items} />}
    </div>
  )
}

export function CartDemo({ fixed = false, tone = 'neutral' }: { fixed?: boolean; tone?: string }) {
  // This list never reorders, it only grows/shrinks at the end, so index keys
  // are fine here (see weirdness #3).
  const [items, setItems] = useState<string[]>([pool[0], pool[1]])

  return (
    <div className={`demo demo-${tone}`}>
      <div className="demo-head">
        <span className="demo-label">{fixed ? '{items.length > 0 && …}' : '{items.length && …}'}</span>
        <span>items.length = {items.length}</span>
      </div>
      <div className="demo-stack">
        <div className="list-controls">
          <button
            className="secondary-btn"
            onClick={() => setItems([...items, pool[items.length % pool.length]])}
          >
            Add item
          </button>
          <button
            className="secondary-btn"
            onClick={() => setItems(items.slice(0, -1))}
            disabled={!items.length}
          >
            Remove item
          </button>
        </div>
        <Cart items={items} fixed={fixed} />
      </div>
    </div>
  )
}
