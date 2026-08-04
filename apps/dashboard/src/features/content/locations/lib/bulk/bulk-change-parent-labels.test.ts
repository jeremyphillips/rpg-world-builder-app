import { ACTION_PLAN_UNCHANGED_REASONS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  formatBulkChangeParentConfigureApplyLabel,
  formatBulkChangeParentConfigureSummary,
} from './bulk-change-parent-labels'

describe('bulk change parent labels', () => {
  it('formats configure summaries for set, clear, and all unchanged states', () => {
    expect(
      formatBulkChangeParentConfigureSummary({
        wouldChangeCount: 2,
        unchangedCount: 1,
        unchangedReasons: [ACTION_PLAN_UNCHANGED_REASONS.already_target_parent],
        parentName: 'Lankhmar',
        isClearing: false,
      }),
    ).toBe('2 locations will move under Lankhmar · 1 already uses Lankhmar')

    expect(
      formatBulkChangeParentConfigureSummary({
        wouldChangeCount: 2,
        unchangedCount: 1,
        unchangedReasons: [ACTION_PLAN_UNCHANGED_REASONS.already_top_level],
        isClearing: true,
      }),
    ).toBe('2 locations will become top-level · 1 is already top-level')

    expect(
      formatBulkChangeParentConfigureSummary({
        wouldChangeCount: 0,
        unchangedCount: 3,
        unchangedReasons: [ACTION_PLAN_UNCHANGED_REASONS.already_target_parent],
        parentName: 'Lankhmar',
        isClearing: false,
      }),
    ).toBe('All 3 locations already use Lankhmar.')
  })

  it('omits apply labels when nothing would change', () => {
    expect(
      formatBulkChangeParentConfigureApplyLabel({ wouldChangeCount: 0, isClearing: false }),
    ).toBeUndefined()
    expect(
      formatBulkChangeParentConfigureApplyLabel({ wouldChangeCount: 2, isClearing: false }),
    ).toBe('Apply to 2 locations')
  })
})
