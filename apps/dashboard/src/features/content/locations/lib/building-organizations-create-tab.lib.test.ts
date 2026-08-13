import { describe, expect, it } from 'vitest'
import type { Organization } from '@rpg/contracts'

import {
  BUILDING_ORGANIZATIONS_NEW_BADGE_LABEL,
  buildBuildingOrganizationPendingEntity,
  buildingOrganizationDiscoveryItemId,
  buildingOrganizationPendingItemId,
  parseBuildingOrganizationDiscoveryItemId,
  parseBuildingOrganizationPendingItemId,
} from './building-organizations-create-tab.lib'
import type { BuildingOrganizationDraftPlan } from './building-organization-create-drafts'

const plan: BuildingOrganizationDraftPlan = {
  organizations: [
    {
      draftOrganizationId: 'organization-new',
      values: {
        name: 'Copper Kettle Cooperative',
        organizationDomain: 'commercial',
        activities: [],
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
  {
    id: 'organization-1',
    name: 'Harbor Merchants Guild',
    organizationDomain: 'commercial',
  },
] as Organization[]

describe('building organizations create tab presentation', () => {
  it('namespaces discovery and pending disclosure ids', () => {
    expect(
      parseBuildingOrganizationDiscoveryItemId(buildingOrganizationDiscoveryItemId('org-1')),
    ).toBe('org-1')
    expect(
      parseBuildingOrganizationPendingItemId(buildingOrganizationPendingItemId('draft-1')),
    ).toBe('draft-1')
    expect(parseBuildingOrganizationDiscoveryItemId('pending:draft-1')).toBeNull()
  })

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
})
