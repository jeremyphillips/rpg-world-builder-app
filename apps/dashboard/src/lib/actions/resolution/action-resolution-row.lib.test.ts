import { describe, expect, it } from 'vitest'

import {
  ACTION_RESOLUTION_ISSUE_ROW_STATES,
  ACTION_RESOLUTION_ISSUE_STATUS_LABELS,
  actionResolutionIssueRowClasses,
  buildActionResolutionIssueRowVariantMap,
  isActionResolutionIssueRowState,
  resolveActionResolutionIssueStatusLabel,
  usesActionResolutionAlignmentCheckbox,
} from './action-resolution-row.lib'
import { actionResolutionRowVariants } from './action-resolution-list.variants'

describe('action-resolution-row.lib', () => {
  it('defines blocked and failed as the only issue row states', () => {
    expect(ACTION_RESOLUTION_ISSUE_ROW_STATES).toEqual(['blocked', 'failed'])
    expect(isActionResolutionIssueRowState('blocked')).toBe(true)
    expect(isActionResolutionIssueRowState('failed')).toBe(true)
    expect(isActionResolutionIssueRowState('eligible')).toBe(false)
    expect(isActionResolutionIssueRowState('updated')).toBe(false)
  })

  it('maps every issue row state to the shared issue row classes', () => {
    const variantMap = buildActionResolutionIssueRowVariantMap()

    for (const state of ACTION_RESOLUTION_ISSUE_ROW_STATES) {
      expect(variantMap[state]).toBe(actionResolutionIssueRowClasses)
      expect(actionResolutionRowVariants({ state })).toBe(
        `flex items-start gap-3 px-3 py-2.5 text-sm ${actionResolutionIssueRowClasses}`,
      )
    }
  })

  it('uses alignment checkboxes only for issue row states', () => {
    expect(usesActionResolutionAlignmentCheckbox('blocked')).toBe(true)
    expect(usesActionResolutionAlignmentCheckbox('failed')).toBe(true)
    expect(usesActionResolutionAlignmentCheckbox('eligible')).toBe(false)
  })

  it('resolves issue status labels for blocked and failed rows', () => {
    expect(resolveActionResolutionIssueStatusLabel('blocked')).toBe(
      ACTION_RESOLUTION_ISSUE_STATUS_LABELS.blocked,
    )
    expect(resolveActionResolutionIssueStatusLabel('failed')).toBe(
      ACTION_RESOLUTION_ISSUE_STATUS_LABELS.failed,
    )
    expect(resolveActionResolutionIssueStatusLabel('eligible')).toBeNull()
  })
})
