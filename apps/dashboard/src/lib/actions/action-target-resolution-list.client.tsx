'use client'

import type { ActionTargetFailure } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import type { ActionResolutionRowModel } from './action-lifecycle.types'
import { actionResolutionListVariants } from './action-resolution-list.variants'
import { ActionTargetResolutionRow } from './action-target-resolution-row.client'

export type ActionTargetResolutionListProps<TBlocker, TFailure extends ActionTargetFailure> = {
  rows: ActionResolutionRowModel<TBlocker, TFailure>[]
  campaignId?: string
  onCheckedChange?: (targetId: string, checked: boolean) => void
  /** Optional legend rendered above the scroll region. */
  legend?: string
}

export function ActionTargetResolutionList<TBlocker, TFailure extends ActionTargetFailure>({
  rows,
  campaignId,
  onCheckedChange,
  legend,
}: ActionTargetResolutionListProps<TBlocker, TFailure>) {
  if (rows.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {legend ? (
        <Text variant="small" className="text-muted-foreground">
          {legend}
        </Text>
      ) : null}
      <ul className={actionResolutionListVariants()} aria-label={legend ?? 'Action targets'}>
        {rows.map((row) => (
          <ActionTargetResolutionRow
            key={row.targetId}
            row={row}
            campaignId={campaignId}
            onCheckedChange={onCheckedChange}
          />
        ))}
      </ul>
    </div>
  )
}
