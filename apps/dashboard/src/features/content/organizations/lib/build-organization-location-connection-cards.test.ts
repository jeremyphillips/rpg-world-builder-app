import { describe, expect, it } from 'vitest'

import {
  ALDERMERE,
  GREYSHORE,
  HARBORFORD,
  LOCATIONS_LIST,
  YAWNING_PORTAL,
} from '../../locations/fixtures'
import { buildLocationsById } from '../../locations/lib/location-display'
import { ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING } from '../../lib/entity-replacement/entity-replacement-current-entity'
import {
  buildOrganizationLocationConnectionCards,
  groupOrganizationLocationConnections,
  resolveOrganizationForwardCurrentLocationEndpoint,
} from './build-organization-location-connection-cards'

const CAMPAIGN_ID = 'camp_1'

describe('buildOrganizationLocationConnectionCards', () => {
  const locationsById = buildLocationsById(LOCATIONS_LIST)

  it('projects headquarters with classification and ancestry', () => {
    const { previewItems } = buildOrganizationLocationConnectionCards(
      [
        {
          connection: {
            id: 'conn-hq',
            locationId: YAWNING_PORTAL.id,
            kind: 'headquarters',
          },
          location: YAWNING_PORTAL,
        },
      ],
      { campaignId: CAMPAIGN_ID, locationsById },
    )

    expect(previewItems[0]?.target).toMatchObject({
      id: YAWNING_PORTAL.id,
      name: 'Yawning Portal',
      classification: { text: 'Building · Tavern' },
    })
    expect(previewItems[0]?.target?.ancestry.items.map((item) => item.name)).toEqual([
      'Aldermere',
      'Greyshore',
      'Harborford',
      'Dock Ward',
    ])
    expect(previewItems[0]?.target?.href).toBe(
      `/campaigns/${CAMPAIGN_ID}/locations/${YAWNING_PORTAL.id}`,
    )
  })

  it('projects operates_in settlement with classification and ancestry', () => {
    const { previewItems } = buildOrganizationLocationConnectionCards(
      [
        {
          connection: {
            id: 'conn-presence',
            locationId: HARBORFORD.id,
            kind: 'operates_in',
          },
          location: HARBORFORD,
        },
      ],
      { campaignId: CAMPAIGN_ID, locationsById },
    )

    expect(previewItems[0]?.target).toMatchObject({
      name: 'Harborford',
      classification: { text: 'Settlement · City' },
    })
    expect(previewItems[0]?.target?.ancestry.items.map((item) => item.name)).toEqual([
      'Aldermere',
      'Greyshore',
    ])
  })

  it('leaves ancestry empty for root locations', () => {
    const { previewItems } = buildOrganizationLocationConnectionCards(
      [
        {
          connection: {
            id: 'conn-governs',
            locationId: ALDERMERE.id,
            kind: 'governs',
          },
          location: ALDERMERE,
        },
      ],
      { campaignId: CAMPAIGN_ID, locationsById },
    )

    expect(previewItems[0]?.target?.ancestry).toEqual({ items: [], text: '' })
  })

  it('uses target null as the sole unresolved state', () => {
    const { previewItems } = buildOrganizationLocationConnectionCards(
      [
        {
          connection: {
            id: 'conn-missing',
            locationId: 'missing-location',
            kind: 'owns',
          },
          location: null,
        },
      ],
      { campaignId: CAMPAIGN_ID, locationsById },
    )

    expect(previewItems[0]?.target).toBeNull()
  })
})

describe('groupOrganizationLocationConnections', () => {
  it('uses contracts forward display labels for kind eyebrows', () => {
    const locationsById = buildLocationsById([GREYSHORE])
    const { previewItems } = buildOrganizationLocationConnectionCards(
      [
        {
          connection: { id: 'conn-1', locationId: GREYSHORE.id, kind: 'governs' },
          location: GREYSHORE,
        },
      ],
      { campaignId: CAMPAIGN_ID, locationsById },
    )

    expect(groupOrganizationLocationConnections(previewItems)[0]?.kindGroups[0]?.kindLabel).toBe(
      'Governs',
    )
  })

  it('marks geographic_presence for eyebrow omission while site keeps show', () => {
    const locationsById = buildLocationsById([HARBORFORD, YAWNING_PORTAL])
    const { previewItems } = buildOrganizationLocationConnectionCards(
      [
        {
          connection: { id: 'conn-1', locationId: HARBORFORD.id, kind: 'operates_in' },
          location: HARBORFORD,
        },
        {
          connection: { id: 'conn-2', locationId: YAWNING_PORTAL.id, kind: 'headquarters' },
          location: YAWNING_PORTAL,
        },
      ],
      { campaignId: CAMPAIGN_ID, locationsById },
    )

    const groups = groupOrganizationLocationConnections(previewItems)
    const geographic = groups.find((group) => group.family === 'geographic_presence')
    const site = groups.find((group) => group.family === 'site')

    expect(geographic).toMatchObject({
      familyLabel: 'Areas of operation',
      kindHeading: 'omit',
    })
    expect(site).toMatchObject({
      familyLabel: 'Sites & facilities',
      kindHeading: 'show',
    })
  })
})

describe('resolveOrganizationForwardCurrentLocationEndpoint', () => {
  const locationsById = buildLocationsById(LOCATIONS_LIST)

  it('maps a resolved location to neutral current snapshot fields', () => {
    expect(
      resolveOrganizationForwardCurrentLocationEndpoint({
        connectionId: 'conn-hq',
        locationReferences: [
          {
            connection: {
              id: 'conn-hq',
              locationId: YAWNING_PORTAL.id,
              kind: 'headquarters',
            },
            location: YAWNING_PORTAL,
          },
        ],
        locationsById,
        campaignId: CAMPAIGN_ID,
      }),
    ).toEqual({
      entity: {
        heading: 'Yawning Portal',
        headingSuffix: ' · Building · Tavern',
        supportingText: 'Located in Dock Ward',
      },
      imageKey: YAWNING_PORTAL.imageKey,
    })
  })

  it('returns unavailable snapshot when persisted location reference is null', () => {
    expect(
      resolveOrganizationForwardCurrentLocationEndpoint({
        connectionId: 'conn-hq',
        locationReferences: [
          {
            connection: {
              id: 'conn-hq',
              locationId: YAWNING_PORTAL.id,
              kind: 'headquarters',
            },
            location: null,
          },
        ],
        locationsById,
        campaignId: CAMPAIGN_ID,
      }),
    ).toEqual({
      entity: { heading: ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING },
      unavailable: true,
    })
  })
})
