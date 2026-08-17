import { describe, expect, it } from 'vitest'

import { createOrganizationInputSchema } from './organization'
import {
  organizationMembershipTitlesSchema,
  resolveOrganizationCreateMembershipTitles,
  snapshotOrganizationMembershipTitlesFromPreset,
  sortOrganizationMembershipTitleDefinitionsForDisplay,
} from './organization-membership-titles'

describe('organization membership title snapshot', () => {
  it('snapshots preset refs with opaque ids and sourceTitleId provenance', () => {
    let count = 0
    const snapshot = snapshotOrganizationMembershipTitlesFromPreset('bank', () => `uuid-${++count}`)
    expect(snapshot[0]).toEqual({
      id: 'omt_uuid-1',
      sourceTitleId: 'treasurer',
      label: 'Treasurer',
      description: expect.any(String),
      priority: 50,
    })
    expect(snapshot.map((title) => title.id)).toEqual([
      'omt_uuid-1',
      'omt_uuid-2',
      'omt_uuid-3',
      'omt_uuid-4',
      'omt_uuid-5',
      'omt_uuid-6',
      'omt_uuid-7',
    ])
    expect(snapshot.every((title) => title.sourceTitleId !== undefined)).toBe(true)
  })

  it('preserves preset array order for equal-priority titles in display sort tie-break', () => {
    const snapshot = snapshotOrganizationMembershipTitlesFromPreset('bank', () => 'a')
    const sorted = sortOrganizationMembershipTitleDefinitionsForDisplay(snapshot)
    const priority50 = sorted.filter((title) => title.priority === 50).map((title) => title.label)
    expect(priority50).toEqual(['Treasurer', 'Proprietor'])
  })

  it('resolves create input from sourcePresetId at the boundary', () => {
    const resolved = resolveOrganizationCreateMembershipTitles({
      sourcePresetId: 'bank',
      createId: () => 'fixed',
    })
    expect(resolved).toHaveLength(7)
    expect(resolved[0]?.sourceTitleId).toBe('treasurer')
    expect(resolved[0]?.id).toBe('omt_fixed')
  })

  it('accepts explicit members.titles when no preset is provided', () => {
    const custom = organizationMembershipTitlesSchema.parse([
      {
        id: 'omt_custom',
        label: 'Keeper of the Third Seal',
        priority: 40,
      },
    ])
    expect(resolveOrganizationCreateMembershipTitles({ titles: custom })).toEqual(custom)
  })

  it('rejects combining sourcePresetId with explicit members.titles on create input', () => {
    expect(
      createOrganizationInputSchema.safeParse({
        slug: 'test-org',
        name: 'Test Org',
        organizationDomain: 'government',
        sourcePresetId: 'bank',
        members: {
          titles: [
            {
              id: 'omt_custom',
              label: 'Custom',
              priority: 10,
            },
          ],
        },
      }).success,
    ).toBe(false)
  })

  it('accepts custom org titles without a canonical vocabulary entry', () => {
    const custom = organizationMembershipTitlesSchema.parse([
      {
        id: 'omt_custom',
        label: 'Keeper of the Third Seal',
        priority: 40,
      },
    ])
    expect(custom[0]).not.toHaveProperty('sourceTitleId')
  })

  it('never uses vocabulary ids as organization title ids', () => {
    const snapshot = snapshotOrganizationMembershipTitlesFromPreset('bank', () => 'fixed')
    for (const title of snapshot) {
      expect(title.id).toBe('omt_fixed')
      expect(title.id).not.toBe(title.sourceTitleId)
    }
  })

  it('does not copy searchTerms into org snapshots', () => {
    const snapshot = snapshotOrganizationMembershipTitlesFromPreset('adventurers_guild', () => 'a')
    for (const title of snapshot) {
      expect(title).not.toHaveProperty('searchTerms')
    }
  })

  it('preserves preset array order through snapshot resolution', () => {
    const snapshot = snapshotOrganizationMembershipTitlesFromPreset('bank', () => 'a')
    expect(snapshot.map((title) => title.sourceTitleId)).toEqual([
      'treasurer',
      'proprietor',
      'banker',
      'manager',
      'cashier',
      'accountant',
      'clerk',
    ])
  })

  it('preserves org title id when the stored label is renamed', () => {
    const renamed = organizationMembershipTitlesSchema.parse([
      {
        id: 'omt_abc',
        sourceTitleId: 'captain',
        label: 'Sea Lord',
        priority: 50,
      },
    ])
    expect(renamed[0]?.id).toBe('omt_abc')
    expect(renamed[0]?.label).toBe('Sea Lord')
  })

  it('allows the same vocabulary title at different priorities across presets', () => {
    const army = snapshotOrganizationMembershipTitlesFromPreset('army', () => 'a')
    const mercenary = snapshotOrganizationMembershipTitlesFromPreset('mercenary_company', () => 'b')
    const armyCaptain = army.find((title) => title.sourceTitleId === 'captain')
    const mercenaryCaptain = mercenary.find((title) => title.sourceTitleId === 'captain')
    expect(armyCaptain?.priority).toBe(40)
    expect(mercenaryCaptain?.priority).toBe(50)
  })

  it('keeps stored org snapshots independent of later vocabulary labels', () => {
    let count = 0
    const snapshot = snapshotOrganizationMembershipTitlesFromPreset('bank', () => `seed-${++count}`)
    const stored = organizationMembershipTitlesSchema.parse(
      snapshot.map((title) =>
        title.sourceTitleId === 'treasurer' ? { ...title, label: 'Legacy Treasurer Label' } : title,
      ),
    )
    expect(stored.find((title) => title.sourceTitleId === 'treasurer')?.label).toBe(
      'Legacy Treasurer Label',
    )
  })
})
