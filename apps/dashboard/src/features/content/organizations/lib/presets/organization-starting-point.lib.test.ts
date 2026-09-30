import { describe, expect, it } from 'vitest'

import {
  buildOrganizationEditFamiliarTypeFormPatch,
  buildOrganizationStartingPointValueSyncPatch,
  listOrganizationStartingPointConfirmOverwriteFieldLabels,
  organizationAuthoringPresetComboboxDescription,
  organizationStartingPointIsCustomized,
} from './organization-starting-point.lib'

describe('organization starting point helpers', () => {
  it('strips combobox description boilerplate from preset catalog copy', () => {
    expect(
      organizationAuthoringPresetComboboxDescription(
        'Closest starting point for bardic college, seminary, and teaching bodies.',
      ),
    ).toBe('Bardic college, seminary, and teaching bodies.')
    expect(organizationAuthoringPresetComboboxDescription('Custom summary.')).toBe(
      'Custom summary.',
    )
  })

  it('materializes startingPointId, taxonomy, classes, and membership titles', () => {
    const patch = buildOrganizationStartingPointValueSyncPatch('bank', {
      discoverableClasses: [],
    })
    expect(patch.startingPointId).toBe('bank')
    expect(patch.organizationDomain).toBe('commercial')
    expect(patch['members.classAffinityIds']).toEqual([])
    expect(Array.isArray(patch['members.titles'])).toBe(true)
    expect((patch['members.titles'] as unknown[]).length).toBeGreaterThan(0)
  })

  it('keeps startingPointId set after materialization (no ephemeral clear)', () => {
    const patch = buildOrganizationStartingPointValueSyncPatch('army', {
      discoverableClasses: [],
    })
    expect(patch.startingPointId).toBe('army')
    expect(patch).not.toHaveProperty('authoringPresetId')
  })

  it('reads nested members.classAffinityIds when detecting customized state', () => {
    const patch = buildOrganizationStartingPointValueSyncPatch('thieves_guild', {
      discoverableClasses: [],
    })
    const unchanged = {
      startingPointId: 'thieves_guild',
      organizationDomain: patch.organizationDomain,
      organizationForm: patch.organizationForm,
      functions: patch.functions,
      practices: patch.practices,
      members: {
        classAffinityIds: patch['members.classAffinityIds'],
        npcTemplateId: patch['members.npcTemplateId'],
        titles: patch['members.titles'],
      },
    }
    expect(organizationStartingPointIsCustomized(unchanged, { discoverableClasses: [] })).toBe(
      false,
    )

    expect(
      organizationStartingPointIsCustomized(
        { ...unchanged, organizationDomain: 'government' },
        { discoverableClasses: [] },
      ),
    ).toBe(true)
  })

  it('lists only customized fields that differ from the incoming preset for confirm copy', () => {
    const patch = buildOrganizationStartingPointValueSyncPatch('thieves_guild', {
      discoverableClasses: [],
    })
    const values = {
      startingPointId: 'thieves_guild',
      organizationDomain: 'government',
      organizationForm: patch.organizationForm,
      functions: patch.functions,
      practices: patch.practices,
      'members.classAffinityIds': patch['members.classAffinityIds'],
      'members.npcTemplateId': patch['members.npcTemplateId'],
    }
    expect(
      listOrganizationStartingPointConfirmOverwriteFieldLabels(values, {
        currentPresetId: 'thieves_guild',
        nextPresetId: 'army',
        discoverableClasses: [],
      }),
    ).toEqual(['Domain'])
  })

  it('treats membership title divergence as customized state', () => {
    const patch = buildOrganizationStartingPointValueSyncPatch('bank', {
      discoverableClasses: [],
    })
    const profileMatch = {
      startingPointId: 'bank',
      organizationDomain: patch.organizationDomain,
      organizationForm: patch.organizationForm,
      functions: patch.functions,
      practices: patch.practices,
      'members.classAffinityIds': patch['members.classAffinityIds'],
      'members.npcTemplateId': patch['members.npcTemplateId'],
    }
    expect(
      organizationStartingPointIsCustomized(
        { ...profileMatch, 'members.titles': [] },
        { discoverableClasses: [] },
      ),
    ).toBe(false)
    expect(
      organizationStartingPointIsCustomized(
        {
          ...profileMatch,
          'members.titles': [{ id: 'omt_custom', label: 'Custom rank', priority: 10 as const }],
        },
        { discoverableClasses: [] },
      ),
    ).toBe(true)
  })

  it('includes membership titles in confirm overwrite labels when the catalog diverges', () => {
    const patch = buildOrganizationStartingPointValueSyncPatch('thieves_guild', {
      discoverableClasses: [],
    })
    const values = {
      startingPointId: 'thieves_guild',
      organizationDomain: patch.organizationDomain,
      organizationForm: patch.organizationForm,
      functions: patch.functions,
      practices: patch.practices,
      'members.classAffinityIds': patch['members.classAffinityIds'],
      'members.npcTemplateId': patch['members.npcTemplateId'],
      'members.titles': [{ id: 'omt_custom', label: 'Custom rank', priority: 10 as const }],
    }
    expect(
      listOrganizationStartingPointConfirmOverwriteFieldLabels(values, {
        currentPresetId: 'thieves_guild',
        nextPresetId: 'army',
        discoverableClasses: [],
      }),
    ).toEqual(['Membership titles'])
  })

  it('builds edit familiar-type patches without membership titles', () => {
    expect(buildOrganizationEditFamiliarTypeFormPatch('gang', [])).toMatchObject({
      organizationDomain: 'criminal',
      organizationForm: null,
      functions: [],
      practices: [],
      'members.classAffinityIds': [],
    })
    expect(buildOrganizationEditFamiliarTypeFormPatch('gang', [])).not.toHaveProperty(
      'members.titles',
    )
  })
})
