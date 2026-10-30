import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import { globalSearchCatalogQueryKey } from '@/lib/query-keys/global-search-catalog'
import { makeTestQueryClient } from '@/test/render'

import { usePatchMechanicsMutation } from './use-patch-mechanics-mutation'
import { rulesetPatchQueryKey } from './use-ruleset-patch'

vi.mock('../api/ruleset-patch-api', () => ({
  patchMechanics: vi.fn(async () => ({ mechanics: {} })),
}))

const CAMPAIGN_ID = 'campaign-1'

describe('usePatchMechanicsMutation', () => {
  it('invalidates the ruleset patch and the search catalog', async () => {
    const queryClient = makeTestQueryClient()
    queryClient.setQueryData(rulesetPatchQueryKey(CAMPAIGN_ID), { mechanics: {} })
    queryClient.setQueryData(globalSearchCatalogQueryKey(CAMPAIGN_ID), { documents: [] })

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }

    const { result } = renderHook(() => usePatchMechanicsMutation(CAMPAIGN_ID), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      armorClass: { mode: 'ascending', base: 9 },
    })

    await waitFor(() => {
      expect(queryClient.getQueryState(rulesetPatchQueryKey(CAMPAIGN_ID))?.isInvalidated).toBe(true)
    })
    expect(queryClient.getQueryState(globalSearchCatalogQueryKey(CAMPAIGN_ID))?.isInvalidated).toBe(
      true,
    )
  })
})
