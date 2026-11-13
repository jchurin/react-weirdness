import { useState, type ReactNode } from 'react'
import CodeBlock from './CodeBlock'

interface QuizProps {
  question: ReactNode
  code: string
  answer: string
  explanation: string
}

export default function Quiz({ question, code, answer, explanation }: QuizProps) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="quiz">
      <p className="quiz-q">{question}</p>
      <CodeBlock code={code} />
      {revealed ? (
        <p className="quiz-a">
          <strong>{answer}.</strong> {explanation}
        </p>
      ) : (
        <button className="secondary-btn" onClick={() => setRevealed(true)}>
          Reveal answer
        </button>
      )}
    </div>
  )
}
