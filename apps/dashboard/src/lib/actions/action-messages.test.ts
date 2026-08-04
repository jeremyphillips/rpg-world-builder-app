import { describe, expect, it } from 'vitest'

import {
  CONTENT_AVAILABILITY_OFF_ACTION,
  formatActionBlockedDescription,
  formatActionBlockedTitle,
  formatActionMixedResult,
  formatActionPartialSuccess,
  formatActionSuccess,
  formatBulkActionSummary,
  VOCABULARY_DISABLE_ACTION,
} from './action-messages'

describe('action messages', () => {
  it('formats blocked titles by mode and action kind', () => {
    expect(
      formatActionBlockedTitle({ mode: 'single', action: CONTENT_AVAILABILITY_OFF_ACTION }),
    ).toBe('Cannot turn off availability')

    expect(
      formatActionBlockedTitle({ mode: 'bulk-partial', action: VOCABULARY_DISABLE_ACTION }),
    ).toBe('Some entries could not be disabled')
  })

  it('ignores generic placeholder target names that would double-prefix copy', () => {
    expect(
      formatActionBlockedDescription({
        mode: 'single',
        action: CONTENT_AVAILABILITY_OFF_ACTION,
        targetName: 'This item',
        blockedCount: 2,
        selectedCount: 2,
        noun: 'item',
        referenceNoun: 'character',
        referenceCount: 2,
      }),
    ).toBe(
      'This content is currently used by 2 active characters. Remove the references before making it unavailable.',
    )
  })

  it('formats single blocked descriptions from scope, not reference count parity with selection', () => {
    expect(
      formatActionBlockedDescription({
        mode: 'single',
        action: CONTENT_AVAILABILITY_OFF_ACTION,
        targetName: 'Sharpshooter',
        blockedCount: 2,
        selectedCount: 2,
        noun: 'item',
        referenceNoun: 'character',
        referenceCount: 2,
      }),
    ).toBe(
      'This Sharpshooter is currently used by 2 active characters. Remove the references before making it unavailable.',
    )

    expect(
      formatActionBlockedDescription({
        mode: 'single',
        action: CONTENT_AVAILABILITY_OFF_ACTION,
        targetName: 'Sharpshooter',
        blockedCount: 2,
        selectedCount: 2,
        noun: 'item',
        referenceNoun: 'character',
        referenceCount: 2,
      }),
    ).not.toContain('selected')
  })

  it('formats blocked descriptions for partial and full bulk blockers', () => {
    expect(
      formatActionBlockedDescription({
        mode: 'bulk-partial',
        blockedCount: 2,
        selectedCount: 5,
        noun: 'items',
      }),
    ).toContain('2 of 5 selected items')

    expect(
      formatActionBlockedDescription({
        mode: 'bulk-partial',
        blockedCount: 2,
        selectedCount: 5,
        noun: 'items',
      }),
    ).toContain('already excluded')

    expect(
      formatActionBlockedDescription({
        mode: 'bulk-all',
        blockedCount: 3,
        selectedCount: 3,
        noun: 'entries',
        referenceNoun: 'reference',
      }),
    ).toContain('All 3 selected entries')
  })

  it('formats bulk summaries and result toasts', () => {
    expect(
      formatBulkActionSummary({
        eligible: 2,
        blocked: 1,
        unchanged: 3,
        failed: 0,
        updated: 0,
        noun: 'items',
      }),
    ).toBe('2 ready · 1 blocked · 3 unchanged')

    expect(formatActionSuccess(2, 'items', 'item')).toBe('Updated 2 items.')
    expect(formatActionPartialSuccess(1, 2, 1, 'entries', 'entry')).toBe(
      'Updated 1 entry. 2 entries blocked. 1 entry failed.',
    )
    expect(formatActionMixedResult(2, 1, 1, 'NPCs', 'NPC')).toBe(
      'Updated 2 NPCs. 1 NPC failed. 1 NPC unchanged.',
    )
  })
})
