'use client'

import type { ContentStatus } from '@rpg/contracts'
import { TableBadgeCell } from '@rpg/ui'

import { CONTENT_STATUS_BADGE } from './content-status-badge'

export function ContentStatusNameBadge({ status }: { status: ContentStatus }) {
  if (status !== 'draft') return null
  const { appearance, tone, label } = CONTENT_STATUS_BADGE.draft
  return (
    <TableBadgeCell appearance={appearance} tone={tone}>
      {label}
    </TableBadgeCell>
  )
}
