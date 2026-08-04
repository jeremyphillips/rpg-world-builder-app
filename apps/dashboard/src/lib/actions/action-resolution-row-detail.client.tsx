'use client'

import type { ActionTargetFailure, ContentUsageBlocker } from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'

import { ActionBlockerReferences } from './action-blocker-references.client'
import type { ActionResolutionRowModel } from './action-lifecycle.types'

export type ActionResolutionRowDetailProps<TBlocker, TFailure extends ActionTargetFailure> = {
  row: ActionResolutionRowModel<TBlocker, TFailure>
  campaignId?: string
}

export function ActionResolutionRowDetail<TBlocker, TFailure extends ActionTargetFailure>({
  row,
  campaignId,
}: ActionResolutionRowDetailProps<TBlocker, TFailure>) {
  if (row.state === 'blocked' && row.blockers && campaignId) {
    return (
      <div className="mt-1">
        <ActionBlockerReferences
          campaignId={campaignId}
          blockers={row.blockers as ContentUsageBlocker[]}
        />
      </div>
    )
  }

  if (row.state === 'failed' && row.failure) {
    return (
      <Text variant="muted" className="text-sm">
        {row.failure.message}
      </Text>
    )
  }

  if (row.state === 'updated') {
    return (
      <SemanticText tone="success" className="text-sm">
        Updated
      </SemanticText>
    )
  }

  return null
}
