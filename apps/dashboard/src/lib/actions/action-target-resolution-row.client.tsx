'use client'

import type { ActionTargetFailure } from '@rpg/contracts'
import { Eyebrow } from '@rpg/ui'

import type { ActionResolutionRowModel } from './action-lifecycle.types'
import { actionResolutionRowVariants } from './action-resolution-list.variants'
import { ActionResolutionRowCheckbox } from './action-resolution-row-checkbox.client'
import { ActionResolutionRowDetail } from './action-resolution-row-detail.client'
import { resolveActionResolutionIssueStatusLabel } from './action-resolution-row.lib'

export type ActionTargetResolutionRowProps<TBlocker, TFailure extends ActionTargetFailure> = {
  row: ActionResolutionRowModel<TBlocker, TFailure>
  campaignId?: string
  onCheckedChange?: (targetId: string, checked: boolean) => void
}

export function ActionTargetResolutionRow<TBlocker, TFailure extends ActionTargetFailure>({
  row,
  campaignId,
  onCheckedChange,
}: ActionTargetResolutionRowProps<TBlocker, TFailure>) {
  const checkboxId = `action-target-${row.targetId}`
  const issueStatusLabel = resolveActionResolutionIssueStatusLabel(row.state)

  return (
    <li className={actionResolutionRowVariants({ state: row.state })}>
      <ActionResolutionRowCheckbox
        row={row}
        checkboxId={checkboxId}
        onCheckedChange={onCheckedChange}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <label
            htmlFor={row.disabled ? undefined : checkboxId}
            className={row.disabled ? 'font-medium' : 'cursor-pointer font-medium'}
          >
            {row.targetName}
          </label>
          {issueStatusLabel ? (
            <Eyebrow size="xs" tone="muted" className="shrink-0">
              {issueStatusLabel}
            </Eyebrow>
          ) : null}
        </div>

        <ActionResolutionRowDetail row={row} campaignId={campaignId} />
      </div>
    </li>
  )
}
