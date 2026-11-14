import { describe, expect, it } from 'vitest'
import { expectIssuesClaimedByControls, expectLabeledIssueCopy } from '@rpg/ui/form/test-utils'

import { createMonsterActionFromAcquisition } from './monster-action-acquisition'
import { monsterActionChoices, monsterClaimReport } from './monster-action-claim-fixtures'

describe('monster action generative claim coverage', () => {
  it('claims every create choice and preset on the production field tree', () => {
    for (const choice of monsterActionChoices()) {
      const row = createMonsterActionFromAcquisition(choice)
      for (const shape of ['created', 'registered'] as const) {
        const report = monsterClaimReport(row, shape).filter((entry) =>
          entry.path.startsWith('actions.'),
        )
        if (report.length === 0) continue
        expectIssuesClaimedByControls(report)
        expectLabeledIssueCopy(report)
      }
    }
  })
})
