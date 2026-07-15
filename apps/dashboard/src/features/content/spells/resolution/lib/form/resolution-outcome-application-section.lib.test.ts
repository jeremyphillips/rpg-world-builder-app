import { describe, expect, it } from 'vitest'

import {
  outcomeApplicationAddTriggerWrapperClassName,
  outcomeApplicationHintContainerClassName,
  outcomeApplicationShowPrimaryEmptySummary,
  resolveOutcomeApplicationSectionChrome,
} from './resolution-outcome-application-section.lib'

describe('outcomeApplicationShowPrimaryEmptySummary', () => {
  it('is true for ready and all-incomplete when no applications exist', () => {
    expect(
      outcomeApplicationShowPrimaryEmptySummary(0, {
        kind: 'ready',
        eligible: [],
        unavailable: [],
      }),
    ).toBe(true)
    expect(
      outcomeApplicationShowPrimaryEmptySummary(0, { kind: 'all-incomplete', unavailable: [] }),
    ).toBe(true)
  })

  it('is false when applications exist or state is terminal', () => {
    expect(
      outcomeApplicationShowPrimaryEmptySummary(1, {
        kind: 'ready',
        eligible: [],
        unavailable: [],
      }),
    ).toBe(false)
    expect(outcomeApplicationShowPrimaryEmptySummary(0, { kind: 'all-applied' })).toBe(false)
  })
})

describe('outcomeApplicationHintContainerClassName', () => {
  it('adds bottom margin for no-authored-effects hints', () => {
    expect(
      outcomeApplicationHintContainerClassName({ kind: 'no-authored-effects' }, false),
    ).toContain('mb-2')
  })

  it('omits top margin when the empty summary already provides spacing', () => {
    expect(
      outcomeApplicationHintContainerClassName({ kind: 'all-incomplete', unavailable: [] }, true),
    ).not.toContain('mt-2')
  })
})

describe('outcomeApplicationAddTriggerWrapperClassName', () => {
  it('omits margin when the empty summary precedes the trigger', () => {
    expect(outcomeApplicationAddTriggerWrapperClassName(true)).toBeUndefined()
    expect(outcomeApplicationAddTriggerWrapperClassName(false)).toBe('mt-2')
  })
})

describe('resolveOutcomeApplicationSectionChrome', () => {
  it('hides supporting copy and shows add trigger for ready empty branches', () => {
    expect(
      resolveOutcomeApplicationSectionChrome(0, {
        kind: 'ready',
        eligible: [],
        unavailable: [],
      }),
    ).toEqual({
      showPrimaryEmptySummary: true,
      supportingCopyVisible: false,
      showAddTrigger: true,
      hintContainerClassName: 'space-y-1',
      addTriggerWrapperClassName: undefined,
    })
  })

  it('shows hints without add trigger for terminal states', () => {
    expect(resolveOutcomeApplicationSectionChrome(0, { kind: 'all-applied' })).toMatchObject({
      showPrimaryEmptySummary: false,
      supportingCopyVisible: true,
      showAddTrigger: false,
    })
    expect(
      resolveOutcomeApplicationSectionChrome(0, { kind: 'no-authored-effects' }),
    ).toMatchObject({
      supportingCopyVisible: true,
      showAddTrigger: false,
    })
  })
})
