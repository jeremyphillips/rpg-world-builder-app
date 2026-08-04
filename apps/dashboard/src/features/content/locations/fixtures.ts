import { buildingClassificationSchema, type Location } from '@rpg/contracts'

import { STORY_CAMPAIGN_ID } from '../lib/fixtures/constants'

const CONTENT_TIMESTAMP = '2026-01-01T00:00:00.000Z'

const baseLocation = {
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: STORY_CAMPAIGN_ID,
  createdAt: CONTENT_TIMESTAMP,
  updatedAt: CONTENT_TIMESTAMP,
  partyAssociations: [],
}

export const ALDERMERE: Location = {
  ...baseLocation,
  id: 'location-aldermere',
  slug: 'aldermere',
  name: 'Aldermere',
  kind: 'world',
}

export const GREYSHORE: Location = {
  ...baseLocation,
  id: 'location-greyshore',
  slug: 'greyshore',
  name: 'Greyshore',
  kind: 'region',
  classification: { kind: 'geographic', type: 'coast' },
  parentLocationId: ALDERMERE.id,
}

export const HARBORFORD: Location = {
  ...baseLocation,
  id: 'location-harborford',
  slug: 'harborford',
  name: 'Harborford',
  kind: 'settlement',
  settlementType: 'city',
  parentLocationId: GREYSHORE.id,
}

export const DOCK_WARD: Location = {
  ...baseLocation,
  id: 'location-dock-ward',
  slug: 'dock-ward',
  name: 'Dock Ward',
  kind: 'district',
  parentLocationId: HARBORFORD.id,
}

export const YAWNING_PORTAL: Location = {
  ...baseLocation,
  id: 'location-yawning-portal',
  slug: 'yawning-portal',
  name: 'Yawning Portal',
  kind: 'structure',
  structureType: 'building',
  classification: buildingClassificationSchema.parse({ archetype: 'tavern' }),
  parentLocationId: DOCK_WARD.id,
}

export const LOCATIONS_LIST = [ALDERMERE, GREYSHORE, HARBORFORD, DOCK_WARD, YAWNING_PORTAL] as const
