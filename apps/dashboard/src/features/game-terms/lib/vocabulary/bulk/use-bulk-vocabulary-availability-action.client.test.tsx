/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/lib/actions/action-outcome-notify.lib', () => ({
  notifyActionOutcomes: vi.fn(),
}))

vi.mock('./bulk-vocabulary-availability-action.lib', () => ({
  validateBulkVocabularyAvailability: vi.fn(),
  applyBulkVocabularyAvailabilityToTargets: vi.fn(),
}))

import { useBulkVocabularyAvailabilityAction } from './use-bulk-vocabulary-availability-action.client'
import {
  applyBulkVocabularyAvailabilityToTargets,
  validateBulkVocabularyAvailability,
} from './bulk-vocabulary-availability-action.lib'

function wrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useBulkVocabularyAvailabilityAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes validate and apply helpers for the lifecycle controller', async () => {
    vi.mocked(validateBulkVocabularyAvailability).mockResolvedValue({
      targets: [{ status: 'eligible', targetId: 'a', targetName: 'A' }],
    })
    vi.mocked(applyBulkVocabularyAvailabilityToTargets).mockResolvedValue([
      { status: 'updated', targetId: 'a' },
    ])

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const { result } = renderHook(
      () =>
        useBulkVocabularyAvailabilityAction({
          campaignId: 'camp_1',
          setId: 'creature-types',
          rows: [
            {
              id: 'a',
              label: 'A',
              source: 'system',
              status: 'active',
              usedBy: 0,
            },
          ],
        }),
      { wrapper: wrapper(queryClient) },
    )

    await result.current.validate([{ targetId: 'a', targetName: 'A' }], 'disabled')
    expect(validateBulkVocabularyAvailability).toHaveBeenCalled()

    const outcomes = await result.current.apply(['a'], 'disabled')
    await waitFor(() => {
      expect(outcomes).toEqual([{ status: 'updated', targetId: 'a' }])
    })
  })
})
