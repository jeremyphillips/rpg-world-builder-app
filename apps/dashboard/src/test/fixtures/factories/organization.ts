import type { Organization, OrganizationMembershipTitleDefinition } from '@rpg/contracts'

import { CONTENT_TIMESTAMP, STORY_CAMPAIGN_ID, STORY_RULESET_ID } from '../constants'

export type OrganizationOverrides = Partial<Organization>

const sampleMembershipTitles: OrganizationMembershipTitleDefinition[] = [
  {
    id: 'omt_fixture_chair',
    sourceTitleId: 'chair',
    label: 'Chair',
    priority: 50,
  },
  {
    id: 'omt_fixture_clerk',
    sourceTitleId: 'clerk',
    label: 'Clerk',
    priority: 10,
  },
]

function cityCouncilCanonicalBase(): Organization {
  return {
    id: 'organization-city-council',
    slug: 'city-council',
    rulesetId: STORY_RULESET_ID,
    source: 'homebrew',
    status: 'published',
    campaignId: STORY_CAMPAIGN_ID,
    createdAt: CONTENT_TIMESTAMP,
    updatedAt: CONTENT_TIMESTAMP,
    name: 'City Council',
    description: '<p>The elected council governing the city.</p>',
    organizationDomain: 'government',
    functions: [],
    practices: [],
    members: {
      classAffinityIds: [],
      speciesAffinityIds: [],
      titles: sampleMembershipTitles,
    },
    connections: { locations: [] },
  } satisfies Organization
}

export function makeOrganization(overrides: OrganizationOverrides = {}): Organization {
  const base = cityCouncilCanonicalBase()
  const slug = overrides.slug ?? base.slug

  return {
    ...base,
    id: overrides.id ?? `organization-${slug}`,
    slug,
    ...overrides,
  }
}
