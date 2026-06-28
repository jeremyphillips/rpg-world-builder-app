import type { Ticket } from '@rpg/contracts/dev-bench'
import { Text } from '@rpg/ui'

interface BlockerListProps {
  blockers: Pick<Ticket, 'id' | 'key' | 'title'>[]
}

export function BlockerList({ blockers }: BlockerListProps) {
  if (blockers.length === 0) {
    return <Text variant="muted">No blockers.</Text>
  }

  return (
    <ul className="space-y-2">
      {blockers.map((ticket) => (
        <li key={ticket.id} className="text-sm">
          <Text className="font-mono text-muted-foreground">{ticket.key}</Text>
          <Text>{ticket.title}</Text>
        </li>
      ))}
    </ul>
  )
}
