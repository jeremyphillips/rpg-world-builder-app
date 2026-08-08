import { describe, expect, it } from 'vitest'

import {
  LOCATION_KIND_BROWSE_FAMILIES,
  locationKindMatchesBrowseFamily,
  resolveLocationKindBrowseFamily,
} from './location-kind-browse-families'

describe('location-kind-browse-families', () => {
  it('maps persisted kinds to presentation families', () => {
    expect(resolveLocationKindBrowseFamily('settlement')).toBe('settlements')
    expect(resolveLocationKindBrowseFamily('district')).toBe('settlements')
    expect(resolveLocationKindBrowseFamily('structure')).toBe('structures')
    expect(resolveLocationKindBrowseFamily('region')).toBe('world_and_regions')
  })

  it('covers every non-structure kind in browse families', () => {
    const coveredKinds = new Set(LOCATION_KIND_BROWSE_FAMILIES.flatMap((family) => family.kinds))

    expect(coveredKinds.has('plane')).toBe(true)
    expect(coveredKinds.has('interior')).toBe(true)
    expect(locationKindMatchesBrowseFamily('site', 'sites')).toBe(true)
  })
})
