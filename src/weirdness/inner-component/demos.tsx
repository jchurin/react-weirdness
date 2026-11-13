import { useState } from 'react'
import { useInstanceTag } from '../../components/useInstanceTag'

interface EmailInputProps {
  email: string
  onChange: (value: string) => void
}

function InputCard({ email, onChange }: EmailInputProps) {
  const { id } = useInstanceTag()
  return (
    <div className="mini-card mount-flash">
      <span className="instance-chip">
        EmailInput · instance <strong>{id}</strong>
      </span>
      <input
        className="note-input single-line"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/** The puzzle: EmailInput is declared inside the form. */
function BrokenForm() {
  const [email, setEmail] = useState('')

  // Intentionally broken: this IS the weirdness. A new component type every render.
  function EmailInput() {
    return <InputCard email={email} onChange={setEmail} />
  }

  return (
    <>
      {/* oxlint-disable-next-line react/static-components -- this IS the weirdness */}
      <EmailInput />
      <p className="typed">You typed: {email || '—'}</p>
    </>
  )
}

/** The fix: EmailInput lives at module level and gets what it needs as props. */
function EmailInput(props: EmailInputProps) {
  return <InputCard {...props} />
}

function FixedForm() {
  const [email, setEmail] = useState('')
  return (
    <>
      <EmailInput email={email} onChange={setEmail} />
      <p className="typed">You typed: {email || '—'}</p>
    </>
  )
}

export function FormDemo({ fixed = false, tone = 'neutral' }: { fixed?: boolean; tone?: string }) {
  return (
    <div className={`demo demo-${tone}`}>
      <div className="demo-head">
        <span className="demo-label">{fixed ? 'EmailInput outside SignupForm' : 'EmailInput inside SignupForm'}</span>
      </div>
      <div className="demo-stack">{fixed ? <FixedForm /> : <BrokenForm />}</div>
    </div>
  )
}
