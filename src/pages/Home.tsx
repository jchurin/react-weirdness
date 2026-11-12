import { Link } from 'react-router-dom'
import { weirdnesses } from '../weirdness/registry'

export default function Home() {
  const first = weirdnesses[0]
  return (
    <article className="page home">
      <h1>
        Welcome to <span className="accent">React Weirdness</span>
      </h1>
      <p className="lead">
        React is predictable — right up until it isn't. Effects that run twice,
        state that seems a render behind, components that remount out of
        nowhere, closures holding on to stale values…
      </p>
      <p>
        This is a field guide to the odd things React does. Each entry shows
        the weird behaviour live, explains <em>why</em> React does it, and how
        to work with it instead of against it. Pick one from the sidebar to get
        started.
      </p>
      {first && (
        <Link className="cta" to={`/weirdness/${first.slug}`}>
          Start with {first.title} →
        </Link>
      )}
    </article>
  )
}
