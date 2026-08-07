import { describe, expect, it } from 'vitest'

import type { Location } from '@rpg/contracts'

import { ALDERMERE, GREYSHORE, HARBORFORD, DOCK_WARD, YAWNING_PORTAL } from '../fixtures'
import {
  filterLocationsByParentBrowseScope,
  locationMatchesParentBrowseScope,
  resolveParentBrowseScopeOptions,
  shouldShowParentBrowseScopes,
} from './location-parent-browse-scope'

describe('location-parent-browse-scope', () => {
  it('matches all candidates when scope is all', () => {
    expect(locationMatchesParentBrowseScope(HARBORFORD, 'all')).toBe(true)
    expect(locationMatchesParentBrowseScope(YAWNING_PORTAL, 'all')).toBe(true)
  })

  it('filters candidates by browse family', () => {
    const candidates = [ALDERMERE, GREYSHORE, HARBORFORD, DOCK_WARD]

    expect(filterLocationsByParentBrowseScope(candidates, 'settlements')).toEqual([
      HARBORFORD,
      DOCK_WARD,
    ])
    expect(filterLocationsByParentBrowseScope(candidates, 'world_and_regions')).toEqual([
      ALDERMERE,
      GREYSHORE,
    ])
  })

  it('derives scope options from families present in eligible candidates', () => {
    expect(resolveParentBrowseScopeOptions([ALDERMERE, GREYSHORE, HARBORFORD])).toEqual([
      { value: 'all', label: 'All' },
      { value: 'world_and_regions', label: 'World & regions' },
      { value: 'settlements', label: 'Settlements' },
    ])
  })

  it('omits families with zero eligible candidates', () => {
    expect(resolveParentBrowseScopeOptions([HARBORFORD, DOCK_WARD])).toEqual([
      { value: 'all', label: 'All' },
      { value: 'settlements', label: 'Settlements' },
    ])
  })

  it('shows browse scopes only when at least two families are present', () => {
    expect(
      shouldShowParentBrowseScopes(
        resolveParentBrowseScopeOptions([ALDERMERE, GREYSHORE, HARBORFORD]),
      ),
    ).toBe(true)
    expect(
      shouldShowParentBrowseScopes(resolveParentBrowseScopeOptions([HARBORFORD, DOCK_WARD])),
    ).toBe(false)
    expect(shouldShowParentBrowseScopes(resolveParentBrowseScopeOptions([ALDERMERE]))).toBe(false)
  })

  it('maps multi-family structure candidates to settlement and world segments', () => {
    const site: Location = {
      ...YAWNING_PORTAL,
      id: 'location-site',
      slug: 'harbor-site',
      name: 'Harbor Site',
      kind: 'site',
      parentLocationId: HARBORFORD.id,
    }

    expect(resolveParentBrowseScopeOptions([HARBORFORD, site, YAWNING_PORTAL])).toEqual([
      { value: 'all', label: 'All' },
      { value: 'settlements', label: 'Settlements' },
      { value: 'sites', label: 'Sites' },
      { value: 'structures', label: 'Structures' },
    ])
  })
})
