import type { EpicTicketBucket } from '@rpg/dev-bench-core'
import { Text } from '@rpg/ui'

interface EpicTicketCountsProps {
  counts: Record<EpicTicketBucket, number>
}

const LABELS: Record<EpicTicketBucket, string> = {
  open: 'Open',
  blocked: 'Blocked',
  done: 'Done',
}

export function EpicTicketCounts({ counts }: EpicTicketCountsProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {(Object.keys(LABELS) as EpicTicketBucket[]).map((bucket) => (
        <Text key={bucket} variant="small" className="text-muted-foreground">
          {LABELS[bucket]}: <span className="font-medium text-foreground">{counts[bucket]}</span>
        </Text>
      ))}
    </div>
  )
}
