/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResolvedVocabularyOptionSet, VocabularyOptionWithUsage } from '@rpg/contracts'

import { vocabularySetQueryKey } from '@/features/vocabulary'
import { useVocabularyAvailabilityToggle } from './use-vocabulary-availability-toggle.client'

vi.mock('@/features/vocabulary', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/vocabulary')>()
  return {
    ...actual,
    fetchVocabularyDisableAvailability: vi.fn(),
    updateVocabularyEntry: vi.fn(),
  }
})

vi.mock('@/lib/notify', () => ({
  notifyVocabularyAvailabilityUpdated: vi.fn(),
  notifyVocabularyAvailabilityUpdateFailed: vi.fn(),
}))

import { updateVocabularyEntry } from '@/features/vocabulary'

const updateVocabularyEntryMock = vi.mocked(updateVocabularyEntry)

const entry: VocabularyOptionWithUsage = {
  id: 'construct',
  label: 'Construct',
  source: 'campaign',
  status: 'disabled',
  usedBy: 0,
}

const mockSet: ResolvedVocabularyOptionSet = {
  id: 'creature-types',
  options: [{ ...entry, status: 'active' }],
}

function wrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useVocabularyAvailabilityToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateVocabularyEntryMock.mockResolvedValue(mockSet)
  })

  it('updates vocabulary set query cache when enabling an entry', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const queryKey = vocabularySetQueryKey('camp_1', 'creature-types')
    queryClient.setQueryData(queryKey, {
      id: 'creature-types',
      options: [entry],
    } satisfies ResolvedVocabularyOptionSet)

    const { result } = renderHook(
      () =>
        useVocabularyAvailabilityToggle({
          campaignId: 'camp_1',
          setId: 'creature-types',
          entry,
        }),
      { wrapper: wrapper(queryClient) },
    )

    await result.current.handleAvailableChange(true)

    await waitFor(() => {
      expect(
        queryClient.getQueryData<ResolvedVocabularyOptionSet>(queryKey)?.options[0]?.status,
      ).toBe('active')
    })
    expect(updateVocabularyEntryMock).toHaveBeenCalledWith(
      'camp_1',
      'creature-types',
      'construct',
      {
        status: 'active',
      },
    )
  })
})
