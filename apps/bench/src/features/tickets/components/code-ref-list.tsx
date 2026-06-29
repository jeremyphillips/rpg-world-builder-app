import type { CodeRef } from '@rpg/contracts/dev-bench'
import { Text } from '@rpg/ui'

interface CodeRefListProps {
  codeRefs: CodeRef[]
}

export function CodeRefList({ codeRefs }: CodeRefListProps) {
  if (codeRefs.length === 0) {
    return <Text variant="muted">No code references.</Text>
  }

  return (
    <ul className="space-y-2">
      {codeRefs.map((ref, index) => (
        <li key={`${ref.path}-${index}`} className="rounded-md border border-border p-3 text-sm">
          <Text className="font-mono">{ref.path}</Text>
          {ref.symbol ? <Text variant="small">Symbol: {ref.symbol}</Text> : null}
          {ref.lineStart != null ? (
            <Text variant="small">
              Lines: {ref.lineStart}
              {ref.lineEnd != null ? `–${ref.lineEnd}` : ''}
            </Text>
          ) : null}
          {ref.note ? <Text variant="muted">{ref.note}</Text> : null}
        </li>
      ))}
    </ul>
  )
}
