import { makeLocation } from '@/test/fixtures/factories/location'

import type { ResidenceLocationPickerItem } from './residence-location-picker-drawer.types'

export const harborfordSettlement = makeLocation({
  id: 'location-harborford',
  slug: 'harborford',
  name: 'Harborford',
  kind: 'settlement',
  settlementType: 'city',
})

export const dockWardDistrict = makeLocation({
  id: 'location-dock-ward',
  slug: 'dock-ward',
  name: 'Dock Ward',
  kind: 'district',
})

export const greyshoreRegion = makeLocation({
  id: 'location-greyshore',
  slug: 'greyshore',
  name: 'Greyshore',
  kind: 'region',
  classification: { kind: 'geographic', type: 'coast' },
})

export const residenceLocationPickerItems: ResidenceLocationPickerItem[] = [
  { location: harborfordSettlement, selected: false },
  { location: dockWardDistrict, selected: false },
  { location: greyshoreRegion, selected: false },
]
