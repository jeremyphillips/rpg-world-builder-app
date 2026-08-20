import { describe, expect, it } from 'vitest'

import {
  EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN,
  resolveBuildingCreateTransactionSummary,
} from './building-organization-create-drafts'

const organizationValues = {
  name: 'City Bank',
  organizationDomain: 'commercial' as const,
  functions: [],
  practices: [],
  members: { classAffinityIds: [], speciesAffinityIds: [] },
}

describe('resolveBuildingCreateTransactionSummary', () => {
  it('returns Create building when there are no new organization drafts', () => {
    expect(resolveBuildingCreateTransactionSummary(EMPTY_BUILDING_ORGANIZATION_DRAFT_PLAN)).toEqual(
      {
        newOrganizationCount: 0,
        submitLabel: 'Create building',
      },
    )
  })

  it('returns singular organization copy for one new draft', () => {
    expect(
      resolveBuildingCreateTransactionSummary({
        organizations: [
          {
            draftOrganizationId: 'draft-1',
            values: { ...organizationValues, name: 'City Bank' },
          },
        ],
        relationships: [],
      }),
    ).toEqual({
      newOrganizationCount: 1,
      submitLabel: 'Create building and organization',
    })
  })

  it('returns plural organization copy for multiple new drafts', () => {
    expect(
      resolveBuildingCreateTransactionSummary({
        organizations: [
          {
            draftOrganizationId: 'draft-1',
            values: { ...organizationValues, name: 'City Bank' },
          },
          {
            draftOrganizationId: 'draft-2',
            values: { ...organizationValues, name: 'Harbor Guild' },
          },
        ],
        relationships: [],
      }),
    ).toEqual({
      newOrganizationCount: 2,
      submitLabel: 'Create building and 2 organizations',
    })
  })

  it('ignores existing-organization relationships when counting new drafts', () => {
    expect(
      resolveBuildingCreateTransactionSummary({
        organizations: [],
        relationships: [
          {
            draftId: 'relationship-1',
            kind: 'owns',
            organization: { kind: 'existing', organizationId: 'organization-1' },
          },
        ],
      }),
    ).toEqual({
      newOrganizationCount: 0,
      submitLabel: 'Create building',
    })
  })
})
