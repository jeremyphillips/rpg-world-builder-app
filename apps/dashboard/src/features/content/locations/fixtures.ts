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
}

export const FAERUN: Location = {
  ...baseLocation,
  id: 'location-faerun',
  slug: 'faerun',
  name: 'Faerûn',
  kind: 'world',
}

export const SWORD_COAST: Location = {
  ...baseLocation,
  id: 'location-sword-coast',
  slug: 'sword-coast',
  name: 'Sword Coast',
  kind: 'region',
  classification: { kind: 'geographic', type: 'coast' },
  parentLocationId: FAERUN.id,
}

export const WATERDEEP: Location = {
  ...baseLocation,
  id: 'location-waterdeep',
  slug: 'waterdeep',
  name: 'Waterdeep',
  kind: 'settlement',
  settlementType: 'city',
  parentLocationId: SWORD_COAST.id,
}

export const DOCK_WARD: Location = {
  ...baseLocation,
  id: 'location-dock-ward',
  slug: 'dock-ward',
  name: 'Dock Ward',
  kind: 'district',
  parentLocationId: WATERDEEP.id,
}

export const YAWNING_PORTAL: Location = {
  ...baseLocation,
  id: 'location-yawning-portal',
  slug: 'yawning-portal',
  name: 'Yawning Portal',
  kind: 'structure',
  structureType: 'building',
  classification: buildingClassificationSchema.parse({ type: 'business', subtype: 'tavern' }),
  parentLocationId: DOCK_WARD.id,
}

export const LOCATIONS_LIST = [FAERUN, SWORD_COAST, WATERDEEP, DOCK_WARD, YAWNING_PORTAL] as const
