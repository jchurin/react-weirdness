import { useState } from 'react'
import { useInstanceTag } from '../../components/useInstanceTag'

function InstanceChip({ name }: { name: string }) {
  const { id, mountedAt } = useInstanceTag()
  return (
    <span className="instance-chip" title={`Mounted at ${mountedAt}`}>
      {name} · instance <strong>{id}</strong> · mounted {mountedAt}
    </span>
  )
}

function LikeButton() {
  const [likes, setLikes] = useState(0)
  return (
    <div className="mini-card mount-flash">
      <InstanceChip name="LikeButton" />
      <button className="like-btn" onClick={() => setLikes(likes + 1)}>
        ♥ {likes}
      </button>
    </div>
  )
}

function Profile({ userId }: { userId?: number }) {
  const [note, setNote] = useState('')
  return (
    <div className="mini-card mount-flash">
      <InstanceChip name="Profile" />
      {userId !== undefined && <div className="mini-sub">Showing user #{userId}</div>}
      <textarea
        className="note-input"
        placeholder="Write a note…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <LikeButton />
    </div>
  )
}

interface ProfileDemoProps {
  /** true: <Profile key={id} />, false: <Profile userId={id} /> */
  withKey: boolean
  label: string
  tone: 'bad' | 'good' | 'neutral'
}

export function ProfileDemo({ withKey, label, tone }: ProfileDemoProps) {
  const [id, setId] = useState(1)
  return (
    <div className={`demo demo-${tone}`}>
      <div className="demo-head">
        <span className="demo-label">{label}</span>
        <span>id = {id}</span>
      </div>
      <div className="demo-stack">
        <button className="secondary-btn" onClick={() => setId(id + 1)}>
          Change ID
        </button>
        {withKey ? <Profile key={id} /> : <Profile userId={id} />}
      </div>
    </div>
  )
}
