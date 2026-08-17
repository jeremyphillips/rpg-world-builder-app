import {
  buildingClassificationSchema,
  type Location,
  type LocationKind,
  type RegionLocation,
} from '@rpg/contracts'

import { CONTENT_TIMESTAMP, STORY_CAMPAIGN_ID, STORY_RULESET_ID } from '../constants'

type LocationOverrides = Partial<Location> & { kind: LocationKind }

const sharedMeta = {
  rulesetId: STORY_RULESET_ID,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: STORY_CAMPAIGN_ID as string | null,
  createdAt: CONTENT_TIMESTAMP,
  updatedAt: CONTENT_TIMESTAMP,
} as const

function worldCanonicalBase(): Location {
  return {
    ...sharedMeta,
    id: 'location-aldermere',
    slug: 'aldermere',
    name: 'Aldermere',
    kind: 'world',
  }
}

function regionCanonicalBase(): RegionLocation {
  return {
    ...sharedMeta,
    id: 'location-greyshore',
    slug: 'greyshore',
    name: 'Greyshore',
    kind: 'region',
    classification: { kind: 'geographic', type: 'coast' },
    parentLocationId: 'location-aldermere',
  }
}

function settlementCanonicalBase(): Location {
  return {
    ...sharedMeta,
    id: 'location-harborford',
    slug: 'harborford',
    name: 'Harborford',
    kind: 'settlement',
    settlementType: 'city',
    parentLocationId: 'location-greyshore',
  }
}

function districtCanonicalBase(): Location {
  return {
    ...sharedMeta,
    id: 'location-dock-ward',
    slug: 'dock-ward',
    name: 'Dock Ward',
    kind: 'district',
    parentLocationId: 'location-harborford',
  }
}

function structureCanonicalBase(): Location {
  return {
    ...sharedMeta,
    id: 'location-yawning-portal',
    slug: 'yawning-portal',
    name: 'Yawning Portal',
    kind: 'structure',
    structureType: 'building',
    classification: buildingClassificationSchema.parse({ facilityType: 'brewery' }),
    parentLocationId: 'location-dock-ward',
  }
}

function defaultCanonicalBase(kind: LocationKind): Location {
  switch (kind) {
    case 'world':
      return worldCanonicalBase()
    case 'region':
      return regionCanonicalBase()
    case 'settlement':
      return settlementCanonicalBase()
    case 'district':
      return districtCanonicalBase()
    case 'structure':
      return structureCanonicalBase()
    default:
      return {
        ...sharedMeta,
        id: `location-${kind}`,
        slug: kind,
        name: kind.charAt(0).toUpperCase() + kind.slice(1),
        kind,
      }
  }
}

export function makeLocation(overrides: LocationOverrides): Location {
  const { kind } = overrides
  const base = defaultCanonicalBase(kind)
  const slug = overrides.slug ?? base.slug

  return {
    ...base,
    ...overrides,
    kind,
    id: overrides.id ?? `location-${slug}`,
    slug,
  } as Location
}
