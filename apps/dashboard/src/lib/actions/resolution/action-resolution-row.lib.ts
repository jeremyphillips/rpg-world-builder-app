import type { ActionResolutionRowState } from '../lifecycle/action-lifecycle.types'

/** Row states that share blocked/failed issue chrome and alignment-checkbox behavior. */
export const ACTION_RESOLUTION_ISSUE_ROW_STATES = [
  'blocked',
  'failed',
] as const satisfies readonly ActionResolutionRowState[]

export type ActionResolutionIssueRowState = (typeof ACTION_RESOLUTION_ISSUE_ROW_STATES)[number]

/** Shared padded `<li>` chrome for issue rows — single edit point for blocked + failed styling. */
export const actionResolutionIssueRowClasses = 'bg-destructive-subtle text-foreground' as const

export function isActionResolutionIssueRowState(
  state: ActionResolutionRowState,
): state is ActionResolutionIssueRowState {
  return (ACTION_RESOLUTION_ISSUE_ROW_STATES as readonly ActionResolutionRowState[]).includes(state)
}

export function buildActionResolutionIssueRowVariantMap(): Record<
  ActionResolutionIssueRowState,
  typeof actionResolutionIssueRowClasses
> {
  return Object.fromEntries(
    ACTION_RESOLUTION_ISSUE_ROW_STATES.map((state) => [state, actionResolutionIssueRowClasses]),
  ) as Record<ActionResolutionIssueRowState, typeof actionResolutionIssueRowClasses>
}

export function usesActionResolutionAlignmentCheckbox(state: ActionResolutionRowState): boolean {
  return isActionResolutionIssueRowState(state)
}

export const ACTION_RESOLUTION_ISSUE_STATUS_LABELS = {
  blocked: 'Blocked',
  failed: 'Failed',
} as const satisfies Record<ActionResolutionIssueRowState, string>

export function resolveActionResolutionIssueStatusLabel(
  state: ActionResolutionRowState,
): string | null {
  return isActionResolutionIssueRowState(state)
    ? ACTION_RESOLUTION_ISSUE_STATUS_LABELS[state]
    : null
}
