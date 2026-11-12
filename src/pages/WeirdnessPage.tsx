import { Navigate, useParams } from 'react-router-dom'
import { findWeirdness } from '../weirdness/registry'

export default function WeirdnessPage() {
  const { slug } = useParams()
  const weirdness = findWeirdness(slug)

  if (!weirdness) return <Navigate to="/" replace />

  const Demo = weirdness.component
  return (
    <article className="page">
      <h1>{weirdness.title}</h1>
      <p className="lead">{weirdness.summary}</p>
      <Demo />
    </article>
  )
}
