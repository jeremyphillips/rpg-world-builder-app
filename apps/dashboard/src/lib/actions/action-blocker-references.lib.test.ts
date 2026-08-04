import { describe, expect, it } from 'vitest'

import { USAGE_REFERENCE_CHARACTER_GROUP_KEY } from '@/lib/usage-references/group-usage-references'

import {
  actionBlockerReferenceFlatListClasses,
  actionBlockerReferenceRowListClasses,
  actionBlockedFlatPanelClasses,
  formatActionBlockedUsageGroupSummary,
} from './action-blocker-references.lib'

describe('action-blocker-references.lib', () => {
  it('uses row and flat reference list SSOT classes', () => {
    expect(actionBlockerReferenceRowListClasses).toContain('list-disc')
    expect(actionBlockerReferenceRowListClasses).toContain('text-xs')

    expect(actionBlockerReferenceFlatListClasses).toContain('list-disc')
    expect(actionBlockerReferenceFlatListClasses).toContain('text-sm')
    expect(actionBlockerReferenceFlatListClasses).toContain('space-y-2')
  })

  it('uses subtle error panel chrome for flat single-blocked lists', () => {
    expect(actionBlockedFlatPanelClasses).toContain('bg-destructive-subtle')
  })

  it('formats character usage summaries verbosely', () => {
    expect(
      formatActionBlockedUsageGroupSummary({
        key: USAGE_REFERENCE_CHARACTER_GROUP_KEY,
        label: 'Characters',
        count: 1,
        references: [],
      }),
    ).toBe('Used by 1 active character')

    expect(
      formatActionBlockedUsageGroupSummary({
        key: USAGE_REFERENCE_CHARACTER_GROUP_KEY,
        label: 'Characters',
        count: 2,
        references: [],
      }),
    ).toBe('Used by 2 active characters')
  })

  it('formats content usage summaries verbosely', () => {
    expect(
      formatActionBlockedUsageGroupSummary({
        key: 'species',
        label: 'Species',
        count: 2,
        references: [],
      }),
    ).toBe('Used by 2 active species entries')
  })
})
