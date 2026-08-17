import { makeOrganization } from '../factories/organization'

export const CITY_COUNCIL = makeOrganization({
  id: 'organization-city-council',
  slug: 'city-council',
  name: 'City Council',
  description: '<p>The elected council governing the city.</p>',
  organizationDomain: 'government',
})

export const SILVER_CIRCLE = makeOrganization({
  id: 'organization-silver-circle',
  slug: 'silver-circle',
  name: 'Silver Circle',
  description: '<p>A learned society studying ancient magic.</p>',
  organizationDomain: 'academic',
})

export const CRAFT_GUILD = makeOrganization({
  id: 'organization-craft-guild',
  slug: 'ironroot-smiths',
  name: 'Ironroot Smiths',
  description: '<p>A craft guild regulating smithing standards and apprentices.</p>',
  organizationDomain: 'occupational',
  organizationForm: 'guild',
  functions: ['standards', 'training'],
  practices: ['apprenticeship', 'blacksmithing'],
})

export const ORGANIZATIONS_LIST = [CITY_COUNCIL, SILVER_CIRCLE, CRAFT_GUILD] as const
