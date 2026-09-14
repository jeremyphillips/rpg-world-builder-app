import { describe, expect, it } from 'vitest'

import {
  deriveMasterDetailAvailabilityScope,
  filterMasterDetailItems,
  resolveMasterDetailPinnedRowId,
} from './master-detail-availability-filter.lib'
import { buildMasterDetailAvailabilityPresentation } from './master-detail-availability.types'

const items = [
  buildMasterDetailAvailabilityPresentation('a', true),
  buildMasterDetailAvailabilityPresentation('b', true),
  buildMasterDetailAvailabilityPresentation('c', false),
]

describe('master-detail-availability-filter.lib', () => {
  it('derives stable count scope for hidden unavailable rows', () => {
    expect(deriveMasterDetailAvailabilityScope(items, false)).toEqual({
      availableCount: 2,
      unavailableCount: 1,
      visibleCount: 2,
    })
  })

  it('hides unavailable rows by default and keeps pinned unavailable rows visible', () => {
    expect(filterMasterDetailItems(items, { showUnavailable: false, pinnedRowId: 'c' })).toEqual([
      items[0],
      items[1],
      items[2],
    ])
    expect(filterMasterDetailItems(items, { showUnavailable: false, pinnedRowId: null })).toEqual([
      items[0],
      items[1],
    ])
  })

  it('pins the selected unavailable row while hidden', () => {
    expect(resolveMasterDetailPinnedRowId(items, 'c', false)).toBe('c')
    expect(resolveMasterDetailPinnedRowId(items, 'c', true)).toBeNull()
    expect(resolveMasterDetailPinnedRowId(items, 'a', false)).toBeNull()
  })
})
