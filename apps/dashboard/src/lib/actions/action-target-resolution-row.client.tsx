'use client'

import type { ActionTargetFailure, ContentUsageBlocker } from '@rpg/contracts'
import { Checkbox, SemanticText } from '@rpg/ui'

import { ActionBlockerReferences } from './action-blocker-references.client'
import type { ActionResolutionRowModel } from './action-lifecycle.types'
import { actionResolutionRowVariants } from './action-resolution-list.variants'

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

  return (
    <li className={actionResolutionRowVariants({ state: row.state })}>
      {!row.disabled && onCheckedChange ? (
        <Checkbox
          id={checkboxId}
          checked={row.checked}
          disabled={row.disabled}
          onCheckedChange={(checked) => onCheckedChange(row.targetId, checked === true)}
          aria-label={`Apply to ${row.targetName}`}
        />
      ) : null}

      <div className="min-w-0 flex-1 space-y-2">
        <label
          htmlFor={row.disabled ? undefined : checkboxId}
          className={row.disabled ? undefined : 'cursor-pointer font-medium'}
        >
          {row.targetName}
        </label>

        {row.state === 'blocked' && row.blockers && campaignId ? (
          <ActionBlockerReferences
            campaignId={campaignId}
            blockers={row.blockers as ContentUsageBlocker[]}
          />
        ) : null}

        {row.state === 'failed' && row.failure ? (
          <SemanticText tone="destructive" className="text-sm">
            {row.failure.message}
          </SemanticText>
        ) : null}

        {row.state === 'updated' ? (
          <SemanticText tone="success" className="text-sm">
            Updated
          </SemanticText>
        ) : null}
      </div>
    </li>
  )
}
