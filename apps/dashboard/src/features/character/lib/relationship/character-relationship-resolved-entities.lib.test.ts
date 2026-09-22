import { describe, expect, it } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'
import { lanternGuild } from '../../components/connections/picker/organization-picker-drawer.fixtures'
import { RESIDENCE_CONNECTION_KIND } from '../connections/residence-location-connection.lib'
import {
  mergeLocationsById,
  mergeOrganizationsById,
  resolveAvailableOrganizationIdSet,
  resolveAvailableResidenceIdSet,
} from './character-relationship-resolved-entities.lib'

describe('character-relationship-resolved-entities', () => {
  it('keeps membership organization names when the catalog query is empty', () => {
    const byId = mergeOrganizationsById(
      [],
      [{ organizationId: lanternGuild.id, organization: lanternGuild }],
    )

    expect(byId.get(lanternGuild.id)?.name).toBe('Lantern Guild')
  })

  it('treats resolved memberships as available on read-only sheets', () => {
    expect(
      resolveAvailableOrganizationIdSet({
        canEdit: false,
        playableOrganizationIds: [],
        memberships: [
          { organizationId: lanternGuild.id, organization: lanternGuild },
          { organizationId: 'missing', organization: null },
        ],
      }),
    ).toEqual(new Set([lanternGuild.id]))
  })

  it('keeps residence location names when the catalog query is empty', () => {
    const harborford = makeLocation({
      id: 'location-harborford',
      name: 'Harborford',
      kind: 'settlement',
      settlementType: 'city',
    })
    const byId = mergeLocationsById(
      [],
      [
        {
          connection: {
            id: 'conn-1',
            locationId: harborford.id,
            kind: RESIDENCE_CONNECTION_KIND,
          },
          location: harborford,
        },
      ],
    )

    expect(byId.get(harborford.id)?.name).toBe('Harborford')
  })

  it('treats resolved residences as available on read-only sheets', () => {
    const harborford = makeLocation({
      id: 'location-harborford',
      name: 'Harborford',
      kind: 'settlement',
      settlementType: 'city',
    })

    expect(
      resolveAvailableResidenceIdSet({
        canEdit: false,
        eligibleLocationIds: [],
        residences: [
          {
            connection: {
              id: 'conn-1',
              locationId: harborford.id,
              kind: RESIDENCE_CONNECTION_KIND,
            },
            location: harborford,
          },
        ],
      }),
    ).toEqual(new Set([harborford.id]))
  })
})
