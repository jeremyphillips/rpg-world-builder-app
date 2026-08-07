import { describe, expect, it } from 'vitest'

import {
  resolveLocationInverseCurrentOrganizationEndpoint,
  resolveOrganizationForwardCurrentLocationEndpoint,
} from './resolve-relationship-drawer-current-endpoint'
import {
  ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING,
  ENTITY_REPLACEMENT_UNAVAILABLE_ORGANIZATION_HEADING,
} from '../entity-replacement/entity-replacement-current-entity'

describe('resolveOrganizationForwardCurrentLocationEndpoint', () => {
  it('returns hydrated location snapshot from relationship references', () => {
    expect(
      resolveOrganizationForwardCurrentLocationEndpoint({
        connectionId: 'conn-1',
        locationReferences: [
          {
            connection: {
              id: 'conn-1',
              locationId: 'loc-1',
              kind: 'headquarters',
            },
            location: {
              id: 'loc-1',
              name: "Thieves' Guildhouse",
              slug: 'thieves-guildhouse',
              kind: 'structure',
              structureType: 'building',
              imageKey: 'img-1',
            } as never,
          },
        ],
      }),
    ).toEqual({
      heading: "Thieves' Guildhouse",
      subheading: 'Building',
      imageKey: 'img-1',
    })
  })

  it('returns unavailable snapshot when persisted location reference is null', () => {
    expect(
      resolveOrganizationForwardCurrentLocationEndpoint({
        connectionId: 'conn-1',
        locationReferences: [
          {
            connection: {
              id: 'conn-1',
              locationId: 'loc-1',
              kind: 'headquarters',
            },
            location: null,
          },
        ],
      }),
    ).toEqual({
      heading: ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING,
      unavailable: true,
    })
  })
})

describe('resolveLocationInverseCurrentOrganizationEndpoint', () => {
  it('returns hydrated organization snapshot from connected party row', () => {
    expect(
      resolveLocationInverseCurrentOrganizationEndpoint({
        relationshipId: 'rel-1',
        rows: [
          {
            relationshipId: 'rel-1',
            subject: {
              id: 'org-1',
              name: 'City Council',
              slug: 'city-council',
              type: 'organization',
            },
            kind: 'governs',
            label: 'Governs',
            family: 'territorial_authority',
            priority: 1,
            sectionGroup: 'territorial_authority',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            organizationKind: 'government',
            imageKey: 'img-1',
          },
        ],
      }),
    ).toEqual({
      heading: 'City Council',
      subheading: 'Government',
      imageKey: 'img-1',
      unavailable: false,
    })
  })

  it('returns unavailable snapshot when row subject cannot be resolved', () => {
    expect(
      resolveLocationInverseCurrentOrganizationEndpoint({
        relationshipId: 'missing',
        rows: [],
      }),
    ).toEqual({
      heading: ENTITY_REPLACEMENT_UNAVAILABLE_ORGANIZATION_HEADING,
      unavailable: true,
    })
  })
})
