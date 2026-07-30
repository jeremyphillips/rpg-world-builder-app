/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/lib/notify', () => ({
  notifyBulkVocabularyAvailabilityResult: vi.fn(),
}))

vi.mock('./bulk-apply-vocabulary-availability.lib', () => ({
  createSkippedBulkVocabularyAvailabilityResult: vi.fn(() => ({
    updatedIds: [],
    blockedResults: [],
    failedIds: [],
    unchangedIds: [],
    summary: null,
    hasBlocked: false,
    hasFailed: false,
    fullSuccess: false,
  })),
  executeBulkVocabularyAvailabilityApply: vi.fn(),
}))

import { notifyBulkVocabularyAvailabilityResult } from '@/lib/notify'

import {
  executeBulkVocabularyAvailabilityApply,
  type BulkVocabularyAvailabilityApplyResult,
} from './bulk-apply-vocabulary-availability.lib'
import { useBulkUpdateVocabularyAvailability } from './use-bulk-update-vocabulary-availability.client'

const applyMock = vi.mocked(executeBulkVocabularyAvailabilityApply)
const notifyMock = vi.mocked(notifyBulkVocabularyAvailabilityResult)

function wrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useBulkUpdateVocabularyAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('emits exactly one aggregate toast and opens blocked dialog for blocked rows', async () => {
    const result: BulkVocabularyAvailabilityApplyResult = {
      updatedIds: ['a'],
      blockedResults: [
        {
          rowId: 'b',
          label: 'B',
          blockers: [
            {
              kind: 'content',
              contentTypeKey: 'species',
              id: 'sp_1',
              label: 'Elf',
              slug: 'elf',
            },
          ],
        },
      ],
      failedIds: [],
      unchangedIds: [],
      summary: 'Updated 1 entry. 1 entry blocked.',
      hasBlocked: true,
      hasFailed: false,
      fullSuccess: false,
    }
    applyMock.mockResolvedValue(result)

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const { result: hook } = renderHook(
      () => useBulkUpdateVocabularyAvailability({ campaignId: 'camp_1', setId: 'creature-types' }),
      { wrapper: wrapper(queryClient) },
    )

    await hook.current.apply(
      [
        {
          id: 'a',
          label: 'A',
          source: 'system',
          status: 'active',
          usedBy: 0,
        },
      ],
      'disabled',
    )

    expect(notifyMock).toHaveBeenCalledTimes(1)
    expect(notifyMock).toHaveBeenCalledWith(result)
    await waitFor(() => {
      expect(hook.current.blockedOpen).toBe(true)
      expect(hook.current.blockedResults).toEqual(result.blockedResults)
    })
  })
})
