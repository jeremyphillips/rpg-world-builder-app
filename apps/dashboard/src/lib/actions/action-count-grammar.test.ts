import { ACTION_PLAN_UNCHANGED_REASONS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  formatAllSelectedDescriptorCount,
  formatBlockedOfWouldChangeDescription,
  formatBulkResolveTally,
  formatCountPhrase,
  formatDescriptorCount,
  formatPronoun,
  formatSubjectVerb,
  formatUnchangedSegment,
  formatWouldChangeUnchangedSummary,
  type BulkActionDescriptor,
} from './action-count-grammar'

const LOCATION_DESCRIPTOR: BulkActionDescriptor = {
  nounSingular: 'location',
  nounPlural: 'locations',
}

const CLASS_DESCRIPTOR: BulkActionDescriptor = {
  nounSingular: 'class',
  nounPlural: 'classes',
}

describe('action count grammar', () => {
  it('formats zero, one, and many count phrases', () => {
    expect(
      formatCountPhrase(0, { zero: '0 locations', one: '1 location', many: '3 locations' }),
    ).toBe('0 locations')
    expect(
      formatCountPhrase(1, { zero: '0 locations', one: '1 location', many: '3 locations' }),
    ).toBe('1 location')
    expect(
      formatCountPhrase(3, { zero: '0 locations', one: '1 location', many: '3 locations' }),
    ).toBe('3 locations')
  })

  it('formats subject verbs and pronouns by count', () => {
    expect(formatSubjectVerb(1, { one: 'is', many: 'are' })).toBe('is')
    expect(formatSubjectVerb(2, { one: 'is', many: 'are' })).toBe('are')
    expect(formatPronoun(1, { one: 'It has', many: 'They have' })).toBe('It has')
    expect(formatPronoun(2, { one: 'It has', many: 'They have' })).toBe('They have')
  })

  it('formats descriptor counts', () => {
    expect(formatDescriptorCount(0, LOCATION_DESCRIPTOR)).toBe('0 locations')
    expect(formatDescriptorCount(1, LOCATION_DESCRIPTOR)).toBe('1 location')
    expect(formatDescriptorCount(3, LOCATION_DESCRIPTOR)).toBe('3 locations')
    expect(formatAllSelectedDescriptorCount(4, CLASS_DESCRIPTOR)).toBe('All 4 selected classes')
  })

  it('formats homogeneous and mixed unchanged segments', () => {
    expect(
      formatUnchangedSegment({
        unchangedCount: 1,
        unchangedReasons: [ACTION_PLAN_UNCHANGED_REASONS.already_target_parent],
        descriptor: LOCATION_DESCRIPTOR,
        formatHomogeneousReason: ({ count }) => `${count} already uses Lankhmar`,
      }),
    ).toBe('1 already uses Lankhmar')

    expect(
      formatUnchangedSegment({
        unchangedCount: 2,
        unchangedReasons: [
          ACTION_PLAN_UNCHANGED_REASONS.already_target_parent,
          ACTION_PLAN_UNCHANGED_REASONS.already_top_level,
        ],
        descriptor: LOCATION_DESCRIPTOR,
        formatHomogeneousReason: () => 'unused',
      }),
    ).toBe('2 unchanged')
  })

  it('formats configure summaries with would-change and unchanged segments', () => {
    expect(
      formatWouldChangeUnchangedSummary({
        wouldChangeCount: 2,
        unchangedCount: 1,
        unchangedReasons: [ACTION_PLAN_UNCHANGED_REASONS.already_target_parent],
        descriptor: LOCATION_DESCRIPTOR,
        formatWouldChangeSegment: ({ wouldChangeCount }) =>
          `${wouldChangeCount} locations will move under Lankhmar`,
        formatHomogeneousReason: ({ count }) => `${count} already uses Lankhmar`,
      }),
    ).toBe('2 locations will move under Lankhmar · 1 already uses Lankhmar')
  })

  it('formats resolve tally lines', () => {
    expect(
      formatBulkResolveTally({
        readyCount: 1,
        blockedCount: 1,
        unchangedCount: 1,
        unchangedReasons: [ACTION_PLAN_UNCHANGED_REASONS.already_target_parent],
        descriptor: LOCATION_DESCRIPTOR,
        formatHomogeneousUnchangedReason: ({ count }) => `${count} already uses Lankhmar`,
      }),
    ).toBe('1 ready · 1 blocked · 1 already uses Lankhmar')

    expect(
      formatBulkResolveTally({
        readyCount: 2,
        blockedCount: 1,
        unchangedCount: 1,
        unchangedReasons: [
          ACTION_PLAN_UNCHANGED_REASONS.already_available,
          ACTION_PLAN_UNCHANGED_REASONS.already_unavailable,
        ],
        descriptor: CLASS_DESCRIPTOR,
        formatHomogeneousUnchangedReason: () => 'unused',
      }),
    ).toBe('2 ready · 1 blocked · 1 unchanged')
  })

  it('formats blocked-of-would-change descriptions', () => {
    expect(
      formatBlockedOfWouldChangeDescription({
        blockedCount: 1,
        wouldChangeCount: 2,
        descriptor: LOCATION_DESCRIPTOR,
        blockerKind: 'hierarchy rules',
      }),
    ).toBe(
      '1 location of 2 locations that would change is blocked by hierarchy rules. It has been excluded from this update.',
    )

    expect(
      formatBlockedOfWouldChangeDescription({
        blockedCount: 2,
        wouldChangeCount: 3,
        descriptor: CLASS_DESCRIPTOR,
        blockerKind: 'active character references',
        continueHint:
          'Remove the references to include them, or continue with the eligible classes.',
      }),
    ).toBe(
      '2 classes of 3 classes that would change are blocked by active character references. They have been excluded from this update. Remove the references to include them, or continue with the eligible classes.',
    )
  })
})
