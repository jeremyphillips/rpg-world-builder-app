import { describe, expect, it } from 'vitest'

import {
  buildOrganizationEditFamiliarTypeFormPatch,
  buildOrganizationStartingPointValueSyncPatch,
  organizationStartingPointIsCustomized,
  ORGANIZATION_STARTING_POINT_TITLE_DIVERGENCE_EXCLUDED_FROM_CUSTOMIZED_DETECTION,
} from './organization-starting-point.lib'

describe('organization starting point helpers', () => {
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
      members: { classAffinityIds: patch['members.classAffinityIds'], titles: [] },
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

  it('excludes membership titles from customized detection by contract', () => {
    expect(ORGANIZATION_STARTING_POINT_TITLE_DIVERGENCE_EXCLUDED_FROM_CUSTOMIZED_DETECTION).toBe(
      true,
    )
    const patch = buildOrganizationStartingPointValueSyncPatch('bank', {
      discoverableClasses: [],
    })
    const customizedDomain = organizationStartingPointIsCustomized(
      {
        startingPointId: 'bank',
        organizationDomain: 'government',
        organizationForm: patch.organizationForm,
        functions: patch.functions,
        practices: patch.practices,
        'members.classAffinityIds': patch['members.classAffinityIds'],
        'members.titles': [],
      },
      { discoverableClasses: [] },
    )
    expect(customizedDomain).toBe(true)
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
