import { makeLocation } from '@/test/fixtures/factories/location'
import { buildingClassificationSchema, type Location, type RegionLocation } from '@rpg/contracts'

export const ALDERMERE = makeLocation({
  kind: 'world',
  id: 'location-aldermere',
  slug: 'aldermere',
  name: 'Aldermere',
})

export const GREYSHORE = makeLocation({
  kind: 'region',
  id: 'location-greyshore',
  slug: 'greyshore',
  name: 'Greyshore',
  classification: { kind: 'geographic', type: 'coast' },
  parentLocationId: ALDERMERE.id,
}) as RegionLocation

export const HARBORFORD = makeLocation({
  kind: 'settlement',
  id: 'location-harborford',
  slug: 'harborford',
  name: 'Harborford',
  settlementType: 'city',
  parentLocationId: GREYSHORE.id,
})

export const DOCK_WARD = makeLocation({
  kind: 'district',
  id: 'location-dock-ward',
  slug: 'dock-ward',
  name: 'Dock Ward',
  parentLocationId: HARBORFORD.id,
})

export const YAWNING_PORTAL = makeLocation({
  kind: 'structure',
  id: 'location-yawning-portal',
  slug: 'yawning-portal',
  name: 'Yawning Portal',
  structureType: 'building',
  classification: buildingClassificationSchema.parse({ facilityType: 'brewery' }),
  parentLocationId: DOCK_WARD.id,
})

export const LOCATIONS_LIST = [ALDERMERE, GREYSHORE, HARBORFORD, DOCK_WARD, YAWNING_PORTAL] as const

export type { Location }
