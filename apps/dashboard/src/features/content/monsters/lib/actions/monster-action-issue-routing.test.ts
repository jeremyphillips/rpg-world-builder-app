import { describe, expect, it } from 'vitest'
import {
  expectIssueCountParity,
  expectIssuesClaimedByControls,
  expectLabeledIssueCopy,
} from '@rpg/ui/form/test-utils'

import {
  blankSaveAction,
  monsterClaimFields,
  monsterClaimReport,
  monsterClaimTabs,
  monsterRoutedIssues,
} from './monster-action-claim-fixtures'

describe('monster save action issue routing', () => {
  it('routes a UI-shaped blank save row to five controls with one count', () => {
    const save = blankSaveAction()
    const report = monsterClaimReport(save, 'registered')
    const actionIssues = report.filter((entry) => entry.path.startsWith('actions.'))

    expectIssuesClaimedByControls(actionIssues)
    expectLabeledIssueCopy(actionIssues)
    expectIssueCountParity({
      issues: monsterRoutedIssues(save, 'registered'),
      tabs: monsterClaimTabs,
      fields: monsterClaimFields,
      tabId: 'actions',
      arrayPath: 'actions',
      expectedCount: 5,
    })
    expect(actionIssues.some((entry) => entry.claim.target.endsWith('_saveFailureNote'))).toBe(true)
    expect(actionIssues.some((entry) => entry.message === 'Required.')).toBe(false)
  })

  it('routes the created save row through controls', () => {
    const report = monsterClaimReport(blankSaveAction(), 'created').filter((entry) =>
      entry.path.startsWith('actions.'),
    )
    expect(report.length).toBeGreaterThan(0)
    expectIssuesClaimedByControls(report)
    expectLabeledIssueCopy(report)
  })
})
