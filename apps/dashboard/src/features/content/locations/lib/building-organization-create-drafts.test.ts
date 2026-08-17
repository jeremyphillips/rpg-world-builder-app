import { describe, expect, it } from 'vitest'
import type { Organization } from '@rpg/contracts'

import {
  BUILDING_ORGANIZATION_NO_ELIGIBLE_KIND_REASON,
  buildBuildingOrganizationRelationshipKindOptions,
  removeBuildingOrganizationRelationshipDraft,
  resolveBuildingOrganizationDiscoveryAddState,
  resolveBuildingOrganizationSelectState,
  upsertBuildingOrganizationRelationshipDraft,
  validateBuildingOrganizationDraftPlan,
  type BuildingOrganizationDraftPlan,
} from './building-organization-create-drafts'

const organizationValues = {
  name: 'Copper Kettle Cooperative',
  organizationDomain: 'commercial' as const,
  functions: [],
  practices: [],
  memberClassAffinityIds: [],
}

function existingOrganization(input: {
  id: string
  connections?: Organization['connections']['locations']
}): Organization {
  return {
    id: input.id,
    name: input.id,
    slug: input.id,
    source: 'homebrew',
    status: 'published',
    organizationDomain: 'commercial',
    functions: [],
    practices: [],
    memberClassAffinityIds: [],
    connections: { locations: input.connections ?? [] },
  } as unknown as Organization
}

describe('Building Organization create drafts', () => {
  it('preserves separate relationship and Organization identities across edits', () => {
    const initial = upsertBuildingOrganizationRelationshipDraft({
      plan: { organizations: [], relationships: [] },
      relationship: {
        draftId: 'relationship-1',
        kind: 'operator',
        organization: { kind: 'new', draftOrganizationId: 'organization-1' },
      },
      organizationDraft: {
        draftOrganizationId: 'organization-1',
        values: organizationValues,
      },
    })
    const edited = upsertBuildingOrganizationRelationshipDraft({
      plan: initial,
      relationship: {
        draftId: 'relationship-1',
        kind: 'tenant',
        organization: { kind: 'new', draftOrganizationId: 'organization-1' },
      },
      organizationDraft: {
        draftOrganizationId: 'organization-1',
        values: { ...organizationValues, name: 'Copper Kettle Guild' },
      },
    })

    expect(edited.relationships).toEqual([
      {
        draftId: 'relationship-1',
        kind: 'tenant',
        organization: { kind: 'new', draftOrganizationId: 'organization-1' },
      },
    ])
    expect(edited.organizations).toEqual([
      {
        draftOrganizationId: 'organization-1',
        values: { ...organizationValues, name: 'Copper Kettle Guild' },
      },
    ])
  })

  it('validates persisted and pending relationships through the authoritative policy', () => {
    const organization = existingOrganization({
      id: 'organization-1',
      connections: [{ id: 'persisted-hq', locationId: 'other-place', kind: 'headquarters' }],
    })
    const plan: BuildingOrganizationDraftPlan = {
      organizations: [],
      relationships: [
        {
          draftId: 'relationship-1',
          kind: 'headquarters',
          organization: { kind: 'existing', organizationId: organization.id },
        },
      ],
    }

    expect(
      validateBuildingOrganizationDraftPlan({ plan, existingOrganizations: [organization] }),
    ).toEqual([
      expect.objectContaining({
        relationshipDraftId: 'relationship-1',
        message: expect.stringContaining('conflicts'),
      }),
    ])
  })

  it('detects conflicts across pending rows for the same Organization', () => {
    const organization = existingOrganization({ id: 'organization-1' })
    const relationships = ['relationship-1', 'relationship-2'].map((draftId) => ({
      draftId,
      kind: 'owns' as const,
      organization: { kind: 'existing' as const, organizationId: organization.id },
    }))

    const issues = validateBuildingOrganizationDraftPlan({
      plan: { organizations: [], relationships },
      existingOrganizations: [organization],
    })

    expect(issues.map((issue) => issue.relationshipDraftId)).toEqual([
      'relationship-1',
      'relationship-2',
    ])
  })

  it('derives disabled kind options from persisted plus pending policy state', () => {
    const organization = existingOrganization({
      id: 'organization-1',
      connections: [{ id: 'persisted-hq', locationId: 'other-place', kind: 'headquarters' }],
    })
    const options = buildBuildingOrganizationRelationshipKindOptions({
      plan: { organizations: [], relationships: [] },
      existingOrganizations: [organization],
      organization: { kind: 'existing', organizationId: organization.id },
    })

    expect(options.find((option) => option.value === 'headquarters')).toMatchObject({
      disabled: true,
      disabledReason: expect.stringContaining('conflicts'),
    })
    expect(options.find((option) => option.value === 'operator')?.disabled).toBeUndefined()
  })

  it('removes an unreferenced new Organization with its relationship row', () => {
    const plan: BuildingOrganizationDraftPlan = {
      organizations: [{ draftOrganizationId: 'organization-1', values: organizationValues }],
      relationships: [
        {
          draftId: 'relationship-1',
          kind: 'operator',
          organization: { kind: 'new', draftOrganizationId: 'organization-1' },
        },
      ],
    }

    expect(removeBuildingOrganizationRelationshipDraft(plan, 'relationship-1')).toEqual({
      organizations: [],
      relationships: [],
    })
  })

  it('disables discovery Add when every relationship kind is blocked', () => {
    expect(
      resolveBuildingOrganizationDiscoveryAddState([
        {
          value: 'owns',
          label: 'Owner',
          description: 'Owns or holds title to a property or site.',
          disabled: true,
          disabledReason: 'Owner is taken.',
        },
        {
          value: 'tenant',
          label: 'Tenant',
          description: 'Occupies or leases space without ownership.',
          disabled: true,
        },
      ]),
    ).toEqual({
      eligibleCount: 0,
      addDisabled: true,
      addDisabledReason: 'Owner is taken.',
    })
    expect(resolveBuildingOrganizationDiscoveryAddState([])).toEqual({
      eligibleCount: 0,
      addDisabled: true,
      addDisabledReason: BUILDING_ORGANIZATION_NO_ELIGIBLE_KIND_REASON,
    })
  })

  it('includes descriptions for intent-stage kind options', () => {
    const options = buildBuildingOrganizationRelationshipKindOptions({
      plan: {
        organizations: [],
        relationships: [
          {
            draftId: 'relationship-hq',
            kind: 'headquarters',
            organization: { kind: 'existing', organizationId: 'organization-1' },
          },
        ],
      },
      existingOrganizations: [existingOrganization({ id: 'organization-1' })],
    })

    expect(options.length).toBeGreaterThan(0)
    for (const option of options) {
      expect(option.description).toEqual(expect.any(String))
    }
  })

  it('keeps intent-stage and per-organization eligibility separate', () => {
    const organization = existingOrganization({
      id: 'organization-1',
      connections: [{ id: 'persisted-hq', locationId: 'other-place', kind: 'headquarters' }],
    })
    const intentOptions = buildBuildingOrganizationRelationshipKindOptions({
      plan: { organizations: [], relationships: [] },
      existingOrganizations: [organization],
    })
    const perOrgOptions = buildBuildingOrganizationRelationshipKindOptions({
      plan: { organizations: [], relationships: [] },
      existingOrganizations: [organization],
      organization: { kind: 'existing', organizationId: organization.id },
    })

    expect(
      intentOptions.find((option) => option.value === 'headquarters')?.disabled,
    ).toBeUndefined()
    expect(perOrgOptions.find((option) => option.value === 'headquarters')).toMatchObject({
      disabled: true,
      disabledReason: expect.stringContaining('conflicts'),
    })
    expect(
      resolveBuildingOrganizationSelectState({
        kind: 'headquarters',
        options: perOrgOptions,
      }),
    ).toEqual({
      selectDisabled: true,
      selectDisabledReason: expect.stringContaining('conflicts'),
    })
  })
})
