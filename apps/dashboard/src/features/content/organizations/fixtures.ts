import type { Organization } from '@rpg/contracts'

const CONTENT_TIMESTAMP = '2026-01-01T00:00:00.000Z'

export const CITY_COUNCIL: Organization = {
  id: 'organization-city-council',
  slug: 'city-council',
  rulesetId: 'srd-cc-5.2.1',
  source: 'homebrew',
  status: 'published',
  campaignId: 'campaign-story',
  createdAt: CONTENT_TIMESTAMP,
  updatedAt: CONTENT_TIMESTAMP,
  name: 'City Council',
  description: '<p>The elected council governing the city.</p>',
  organizationDomain: 'government',
  functions: [],
  practices: [],
  memberClassAffinityIds: [],
  connections: { locations: [] },
}

export const SILVER_CIRCLE: Organization = {
  ...CITY_COUNCIL,
  id: 'organization-silver-circle',
  slug: 'silver-circle',
  name: 'Silver Circle',
  description: '<p>A learned society studying ancient magic.</p>',
  organizationDomain: 'academic',
}

export const CRAFT_GUILD: Organization = {
  ...CITY_COUNCIL,
  id: 'organization-craft-guild',
  slug: 'ironroot-smiths',
  name: 'Ironroot Smiths',
  description: '<p>A craft guild regulating smithing standards and apprentices.</p>',
  organizationDomain: 'occupational',
  organizationForm: 'guild',
  functions: ['standards', 'training'],
  practices: ['apprenticeship', 'blacksmithing'],
}

export const ORGANIZATIONS_LIST = [CITY_COUNCIL, SILVER_CIRCLE, CRAFT_GUILD] as const
