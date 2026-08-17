import { describe, expect, it } from 'vitest'

import { makeOrganization } from '@/test/fixtures/factories/organization'

import {
  BUILDING_ORGANIZATIONS_NEW_BADGE_LABEL,
  buildBuildingOrganizationPendingEntity,
  resolveBuildingOrganizationTargetName,
} from './building-organizations-create-tab.lib'
import type { BuildingOrganizationDraftPlan } from './building-organization-create-drafts'

const plan: BuildingOrganizationDraftPlan = {
  organizations: [
    {
      draftOrganizationId: 'organization-new',
      values: {
        name: 'Copper Kettle Cooperative',
        organizationDomain: 'commercial',
        functions: [],
        practices: [],
        memberClassAffinityIds: [],
      },
    },
  ],
  relationships: [
    {
      draftId: 'relationship-existing',
      kind: 'owns',
      organization: { kind: 'existing', organizationId: 'organization-1' },
    },
    {
      draftId: 'relationship-new',
      kind: 'operator',
      organization: { kind: 'new', draftOrganizationId: 'organization-new' },
    },
  ],
}

const organizations = [
  makeOrganization({
    id: 'organization-1',
    name: 'Harbor Merchants Guild',
    organizationDomain: 'commercial',
  }),
]

describe('building organizations create tab presentation', () => {
  it('builds pending entity anatomy as name · domain · relationship', () => {
    expect(
      buildBuildingOrganizationPendingEntity({
        relationship: plan.relationships[0]!,
        plan,
        existingOrganizations: organizations,
      }),
    ).toEqual({
      heading: 'Harbor Merchants Guild',
      classification: 'Commercial · Owner',
    })
    expect(
      buildBuildingOrganizationPendingEntity({
        relationship: plan.relationships[1]!,
        plan,
        existingOrganizations: organizations,
      }),
    ).toEqual({
      heading: 'Copper Kettle Cooperative',
      classification: 'Commercial · Operator',
      status: [{ kind: 'badge', label: BUILDING_ORGANIZATIONS_NEW_BADGE_LABEL, tone: 'info' }],
    })
  })

  it('resolves organization target names for review summaries', () => {
    expect(
      resolveBuildingOrganizationTargetName({
        organization: plan.relationships[0]!.organization,
        plan,
        existingOrganizations: organizations,
      }),
    ).toBe('Harbor Merchants Guild')
    expect(
      resolveBuildingOrganizationTargetName({
        organization: plan.relationships[1]!.organization,
        plan,
        existingOrganizations: organizations,
      }),
    ).toBe('Copper Kettle Cooperative')
  })
})
