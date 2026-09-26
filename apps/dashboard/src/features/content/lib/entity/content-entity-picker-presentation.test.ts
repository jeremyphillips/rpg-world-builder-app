import { describe, expect, it } from 'vitest'

import { YAWNING_PORTAL, LOCATIONS_LIST } from '../../locations/fixtures'
import {
  buildLocationsById,
  buildLocationEntitySummaryVm,
} from '../../locations/lib/location-display'
import { CITY_COUNCIL } from '../../organizations/fixtures'
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

    const model = buildLocationPickerEntitySummary(summary)

    expect(model).toMatchObject({
      heading: 'Yawning Portal',
      classification: 'Building · Brewery',
      description: 'Located in Dock Ward',
    })
    expect(model.media).toBeTruthy()
  })

  it('builds organization picker rows with inline kind suffix', () => {
    const model = buildOrganizationPickerEntitySummary(CITY_COUNCIL)

    expect(model).toMatchObject({
      heading: 'City Council',
      classification: 'Government',
    })
    expect(model.description).toBeUndefined()
    expect(model.media).toBeTruthy()
  })

  it('builds character picker rows with member-style metadata and always-on media', () => {
    const model = buildCharacterPickerEntitySummary({
      id: 'char-1',
      name: 'Frug Daergel',
      summary: 'Human · Level 1 Fighter',
      characterType: 'pc',
      classIds: ['srd-cc-5.2.1:fighter'],
    })

    expect(model).toMatchObject({
      heading: 'Frug Daergel',
      description: 'PC · Human · Level 1 Fighter',
    })
    expect(model.classification).toBeUndefined()
    expect(model.media).toBeTruthy()
  })
})
