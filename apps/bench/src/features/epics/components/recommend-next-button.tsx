import { useCallback, useState } from 'react'

import type { Epic, Ticket } from '@rpg/contracts/dev-bench'
import { suggestNextTicket } from '@rpg/dev-bench-core'
import { Button, Text } from '@rpg/ui'

export interface RecommendNextButtonProps {
  tickets: Ticket[]
  epics: Epic[]
  epicId: string
  onSelectTicket: (ticketId: string) => void
}

export function RecommendNextButton({
  tickets,
  epics,
  epicId,
  onSelectTicket,
}: RecommendNextButtonProps) {
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null)

  const handleRecommend = useCallback(() => {
    const next = suggestNextTicket(tickets, epics, { epicId })

    if (!next) {
      setEmptyMessage('No eligible tickets — add to backlog or move to Up Next.')
      return
    }

    setEmptyMessage(null)
    onSelectTicket(next.id)
  }, [tickets, epics, epicId, onSelectTicket])

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant="outline" onClick={handleRecommend}>
        Recommend next
      </Button>
      {emptyMessage ? (
        <Text variant="muted" role="status">
          {emptyMessage}
        </Text>
      ) : null}
    </div>
  )
}
