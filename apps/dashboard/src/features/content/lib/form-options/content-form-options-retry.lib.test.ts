import { describe, expect, it, vi } from 'vitest'

import {
  failedContentFormCatalogQueries,
  refetchFailedContentFormCatalogQueries,
  type ContentFormCatalogQuery,
} from './content-form-options-retry.lib'

function query(
  partial: Partial<ContentFormCatalogQuery> & Pick<ContentFormCatalogQuery, 'isError'>,
): ContentFormCatalogQuery {
  return {
    isPending: false,
    refetch: vi.fn().mockResolvedValue(undefined),
    ...partial,
  }
}

describe('content-form-options-retry.lib', () => {
  it('refetches only failed queries on partial outage', async () => {
    const okRefetch = vi.fn().mockResolvedValue(undefined)
    const failedRefetch = vi.fn().mockResolvedValue(undefined)
    const queries = [
      query({ isError: false, refetch: okRefetch }),
      query({ isError: true, refetch: failedRefetch }),
    ]

    expect(failedContentFormCatalogQueries(queries)).toHaveLength(1)
    await refetchFailedContentFormCatalogQueries(queries)

    expect(failedRefetch).toHaveBeenCalledOnce()
    expect(okRefetch).not.toHaveBeenCalled()
  })
})
