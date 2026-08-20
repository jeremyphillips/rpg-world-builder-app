import { USAGE_BLOCKER_SOURCE_KEYS } from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'

import { BULK_CHANGE_PARENT_DESCRIPTOR } from '@/features/content/locations/lib/hierarchy/bulk/bulk-change-parent-labels'

import { groupUsageBlockersBySourceKey } from './group-usage-blockers-by-source'
import {
  resetUsageBlockerSourceKeyWarningsForTests,
  resolveUsageBlockerSourceKey,
} from './resolve-usage-blocker-source-key'
import {
  formatUsageBlockerBulkDescription,
  formatUsageBlockerItemSummary,
  resolveUsageBlockerCopyEntry,
} from './usage-blocker-copy'

describe('usage-blocker-copy', () => {
  it('formats location_parent conflict and row copy with distinct counts', () => {
    const entry = resolveUsageBlockerCopyEntry([USAGE_BLOCKER_SOURCE_KEYS.location_parent])

    expect(
      entry.formatConflictReason({
        blockedTargetCount: 2,
        wouldChangeCount: 3,
        descriptor: BULK_CHANGE_PARENT_DESCRIPTOR,
      }),
    ).toBe('2 locations of 3 locations that would change are referenced by other locations.')

    expect(entry.formatItemSummary(1)).toBe('Parent of 1 location')
    expect(entry.formatResolution({ blockedTargetCount: 2 })).toBe(
      'Move the child locations to another parent',
    )
  })

  it('assembles partial bulk description with shared continuation shell', () => {
    expect(
      formatUsageBlockerBulkDescription({
        mode: 'bulk-partial',
        blockedTargetCount: 2,
        wouldChangeCount: 3,
        eligibleCount: 1,
        descriptor: BULK_CHANGE_PARENT_DESCRIPTOR,
        sourceKeys: [USAGE_BLOCKER_SOURCE_KEYS.location_parent],
      }),
    ).toBe(
      '2 locations of 3 locations that would change are referenced by other locations. They have been excluded from this update. Move the child locations to another parent, or continue with 1 location.',
    )
  })

  it('assembles all-blocked description with resolution before trying again', () => {
    expect(
      formatUsageBlockerBulkDescription({
        mode: 'bulk-all',
        blockedTargetCount: 2,
        wouldChangeCount: 2,
        eligibleCount: 0,
        descriptor: BULK_CHANGE_PARENT_DESCRIPTOR,
        sourceKeys: [USAGE_BLOCKER_SOURCE_KEYS.location_parent],
      }),
    ).toBe(
      '2 locations of 2 locations that would change are referenced by other locations. They have been excluded from this update. Move the child locations to another parent before trying again.',
    )
  })

  it('uses mixed-source aggregate copy when multiple keys are present', () => {
    expect(
      formatUsageBlockerBulkDescription({
        mode: 'bulk-partial',
        blockedTargetCount: 2,
        wouldChangeCount: 3,
        eligibleCount: 1,
        descriptor: BULK_CHANGE_PARENT_DESCRIPTOR,
        sourceKeys: [
          USAGE_BLOCKER_SOURCE_KEYS.location_parent,
          USAGE_BLOCKER_SOURCE_KEYS.character_usage,
        ],
      }),
    ).toContain('are still referenced and cannot be updated')
    expect(
      formatUsageBlockerBulkDescription({
        mode: 'bulk-partial',
        blockedTargetCount: 2,
        wouldChangeCount: 3,
        eligibleCount: 1,
        descriptor: BULK_CHANGE_PARENT_DESCRIPTOR,
        sourceKeys: [
          USAGE_BLOCKER_SOURCE_KEYS.location_parent,
          USAGE_BLOCKER_SOURCE_KEYS.character_usage,
        ],
      }),
    ).toContain('Review the references before continuing')
  })

  it('never uses character copy for unknown keys', () => {
    expect(formatUsageBlockerItemSummary(USAGE_BLOCKER_SOURCE_KEYS.unknown, 1)).toBe(
      'Referenced by 1 item',
    )
    expect(
      resolveUsageBlockerCopyEntry([USAGE_BLOCKER_SOURCE_KEYS.unknown]).formatResolution({
        blockedTargetCount: 1,
      }),
    ).toBe('Review the references before continuing')
  })
})

describe('semantic sourceKey resolution', () => {
  it('groups blockers by stamped sourceKey, not content type labels', () => {
    const groups = groupUsageBlockersBySourceKey([
      {
        kind: 'content',
        sourceKey: USAGE_BLOCKER_SOURCE_KEYS.location_parent,
        contentTypeKey: 'locations',
        id: 'child-1',
        label: 'Thieves Guildhouse',
        slug: 'thieves-guildhouse',
      },
      {
        kind: 'content',
        sourceKey: USAGE_BLOCKER_SOURCE_KEYS.unknown,
        contentTypeKey: 'locations',
        id: 'other-1',
        label: 'Other',
        slug: 'other',
      },
    ])

    expect(groups).toHaveLength(2)
    expect(groups.map((group) => group.sourceKey).sort()).toEqual([
      USAGE_BLOCKER_SOURCE_KEYS.location_parent,
      USAGE_BLOCKER_SOURCE_KEYS.unknown,
    ])
  })

  it('warns and falls back when sourceKey is missing', () => {
    resetUsageBlockerSourceKeyWarningsForTests()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(
      resolveUsageBlockerSourceKey({
        kind: 'content',
        contentTypeKey: 'locations',
        id: 'x',
        label: 'X',
        slug: 'x',
      }),
    ).toBe(USAGE_BLOCKER_SOURCE_KEYS.unknown)

    expect(warn).toHaveBeenCalled()

    warn.mockRestore()
  })

  it('keeps campaign primary world distinct from location_parent', () => {
    expect(
      resolveUsageBlockerSourceKey({
        kind: 'rule',
        code: 'campaign_primary_world',
        message: 'Primary world',
        sourceKey: USAGE_BLOCKER_SOURCE_KEYS.campaign_primary_world,
      }),
    ).toBe(USAGE_BLOCKER_SOURCE_KEYS.campaign_primary_world)

    expect(formatUsageBlockerItemSummary(USAGE_BLOCKER_SOURCE_KEYS.campaign_primary_world, 1)).toBe(
      'Primary world for 1 campaign',
    )
    expect(formatUsageBlockerItemSummary(USAGE_BLOCKER_SOURCE_KEYS.location_parent, 1)).toBe(
      'Parent of 1 location',
    )
  })
})
