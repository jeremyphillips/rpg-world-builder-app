import { describe, expect, it } from 'vitest'

import { YAWNING_PORTAL, LOCATIONS_LIST } from '../locations/fixtures'
import { buildLocationsById, buildLocationEntitySummaryVm } from '../locations/lib/location-display'
import { CITY_COUNCIL } from '../organizations/fixtures'
import {
  buildCharacterPickerEntitySummary,
  buildLocationPickerEntitySummary,
  buildOrganizationPickerEntitySummary,
} from './content-entity-picker-presentation.lib'

describe('content-entity-picker-presentation', () => {
  it('builds location picker rows with inline classification and located-in metadata', () => {
    const locationsById = buildLocationsById(LOCATIONS_LIST)
    const summary = buildLocationEntitySummaryVm(YAWNING_PORTAL, {
      locationsById,
      campaignId: 'camp-1',
    })

    expect(buildLocationPickerEntitySummary(summary)).toEqual({
      heading: 'Yawning Portal',
      classification: 'Building · Brewery',
      description: 'Located in Dock Ward',
      media: undefined,
    })
  })

  it('builds organization picker rows with inline kind suffix', () => {
    expect(buildOrganizationPickerEntitySummary(CITY_COUNCIL)).toEqual({
      heading: 'City Council',
      classification: 'Government',
      description: undefined,
      media: undefined,
    })
  })

  it('builds character picker rows with type on the heading line and identity below', () => {
    expect(
      buildCharacterPickerEntitySummary({
        id: 'char-1',
        name: 'Frug Daergel',
        summary: 'Human · Level 1 Fighter',
        characterType: 'pc',
      }),
    ).toEqual({
      heading: 'Frug Daergel',
      classification: 'PC',
      description: 'Human · Level 1 Fighter',
      media: undefined,
    })
  })
})
