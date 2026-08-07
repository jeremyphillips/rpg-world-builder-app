import { describe, expect, it } from 'vitest'

import { YAWNING_PORTAL, LOCATIONS_LIST } from '../locations/fixtures'
import { buildLocationsById, buildLocationEntitySummaryVm } from '../locations/lib/location-display'
import { CITY_COUNCIL } from '../organizations/fixtures'
import {
  buildCharacterPickerCardPresentation,
  buildLocationPickerCardPresentation,
  buildOrganizationPickerCardPresentation,
} from './content-entity-picker-presentation.lib'

describe('content-entity-picker-presentation', () => {
  it('builds location picker rows with inline classification and located-in metadata', () => {
    const locationsById = buildLocationsById(LOCATIONS_LIST)
    const summary = buildLocationEntitySummaryVm(YAWNING_PORTAL, {
      locationsById,
      campaignId: 'camp-1',
    })

    expect(buildLocationPickerCardPresentation(summary)).toEqual({
      heading: 'Yawning Portal',
      headingSuffix: ' · Building · Tavern',
      metadata: 'Located in Dock Ward',
    })
  })

  it('builds organization picker rows with inline kind suffix', () => {
    expect(buildOrganizationPickerCardPresentation(CITY_COUNCIL)).toEqual({
      heading: 'City Council',
      headingSuffix: ' · Government',
    })
  })

  it('builds character picker rows with type on the heading line and identity below', () => {
    expect(
      buildCharacterPickerCardPresentation({
        id: 'char-1',
        name: 'Frug Daergel',
        summary: 'Human · Level 1 Fighter',
        characterType: 'pc',
      }),
    ).toEqual({
      heading: 'Frug Daergel',
      headingSuffix: ' · PC',
      metadata: 'Human · Level 1 Fighter',
    })
  })
})
