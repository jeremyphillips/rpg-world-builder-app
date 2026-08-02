'use client'

import { CircleSlash } from 'lucide-react'
import type { VocabularyOptionStatus } from '@rpg/contracts'

type VocabularyAvailabilityMetadataProps = {
  status: VocabularyOptionStatus
}

/** Line-2 availability metadata for vocabulary overview name cells. */
export function VocabularyAvailabilityMetadata({ status }: VocabularyAvailabilityMetadataProps) {
  if (status === 'active') {
    return null
  }

  return (
    <div className="ml-auto flex items-center gap-1 text-xs leading-4 text-muted-foreground">
      <CircleSlash aria-hidden className="size-3 shrink-0 text-semantic-warning" />
      <span className="text-semantic-warning">Unavailable</span>
    </div>
  )
}
