interface CodeBlockProps {
  code: string
  /** 1-based line numbers to highlight */
  highlight?: number[]
}

export default function CodeBlock({ code, highlight = [] }: CodeBlockProps) {
  const lines = code.replace(/^\n|\n\s*$/g, '').split('\n')
  return (
    <pre className="code">
      {lines.map((line, i) => (
        <div key={i} className={highlight.includes(i + 1) ? 'code-line hl' : 'code-line'}>
          {line || ' '}
        </div>
      ))}
    </pre>
  )
}
