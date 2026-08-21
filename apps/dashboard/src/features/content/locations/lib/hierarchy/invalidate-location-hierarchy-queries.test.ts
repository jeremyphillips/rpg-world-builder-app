import { describe, expect, it, vi } from 'vitest'

import { makeTestQueryClient } from '@/test/render'

import { invalidateLocationHierarchyQueries } from './invalidate-location-hierarchy-queries'

describe('invalidateLocationHierarchyQueries', () => {
  it('invalidates the campaign locations list query key', () => {
    const queryClient = makeTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateLocationHierarchyQueries(queryClient, 'camp_1')

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['campaigns', 'camp_1', 'content', 'locations'],
    })
  })
})
