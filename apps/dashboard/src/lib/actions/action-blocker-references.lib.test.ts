import { USAGE_BLOCKER_SOURCE_KEYS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

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

  it('formats row summaries from semantic sourceKey', () => {
    expect(
      formatActionBlockedUsageGroupSummary({
        sourceKey: USAGE_BLOCKER_SOURCE_KEYS.location_parent,
        referenceCount: 1,
      }),
    ).toBe('Parent of 1 location')

    expect(
      formatActionBlockedUsageGroupSummary({
        sourceKey: USAGE_BLOCKER_SOURCE_KEYS.character_usage,
        referenceCount: 2,
      }),
    ).toBe('Referenced by 2 active characters')
  })
})
