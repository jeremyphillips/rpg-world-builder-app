'use client'

import type { ActionTargetFailure, ContentUsageBlocker } from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'

import { ActionBlockerReferences } from '../blocker/action-blocker-references.client'
import { actionBlockerReferenceRowListClasses } from '../blocker/action-blocker-references.lib'
import type { ActionResolutionRowModel } from '../lifecycle/action-lifecycle.types'

function hasUsageReferenceBlockers(blockers: readonly unknown[]): boolean {
  return blockers.some(
    (blocker) =>
      typeof blocker === 'object' &&
      blocker !== null &&
      'kind' in blocker &&
      (blocker.kind === 'usage' || blocker.kind === 'content'),
  )
}

function extractRuleBlockerMessages(
  blockers: readonly unknown[],
): Array<{ key: string; message: string }> {
  return blockers.flatMap((blocker, index) => {
    if (
      typeof blocker !== 'object' ||
      blocker === null ||
      !('kind' in blocker) ||
      blocker.kind !== 'rule' ||
      !('message' in blocker) ||
      typeof blocker.message !== 'string'
    ) {
      return []
    }

    const code = 'code' in blocker && typeof blocker.code === 'string' ? blocker.code : `${index}`
    return [{ key: code, message: blocker.message }]
  })
}

export type ActionResolutionRowDetailProps<TBlocker, TFailure extends ActionTargetFailure> = {
  row: ActionResolutionRowModel<TBlocker, TFailure>
  campaignId?: string
}

export function ActionResolutionRowDetail<TBlocker, TFailure extends ActionTargetFailure>({
  row,
  campaignId,
}: ActionResolutionRowDetailProps<TBlocker, TFailure>) {
  if (row.state === 'blocked' && row.blockers && row.blockers.length > 0) {
    if (hasUsageReferenceBlockers(row.blockers) && campaignId) {
      return (
        <div className="mt-1">
          <ActionBlockerReferences
            campaignId={campaignId}
            blockers={row.blockers as ContentUsageBlocker[]}
          />
        </div>
      )
    }

    const ruleMessages = extractRuleBlockerMessages(row.blockers)
    if (ruleMessages.length > 0) {
      return (
        <ul className={actionBlockerReferenceRowListClasses} role="list">
          {ruleMessages.map((blocker) => (
            <li key={blocker.key}>
              <Text variant="muted" className="text-sm">
                {blocker.message}
              </Text>
            </li>
          ))}
        </ul>
      )
    }
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
