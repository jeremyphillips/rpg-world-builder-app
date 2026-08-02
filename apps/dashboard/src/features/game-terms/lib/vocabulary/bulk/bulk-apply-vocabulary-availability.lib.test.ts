import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

vi.mock('@/features/vocabulary', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/vocabulary')>()
  return {
    ...actual,
    fetchVocabularyDisableAvailability: vi.fn(),
    updateVocabularyEntry: vi.fn(),
  }
})

import { fetchVocabularyDisableAvailability, updateVocabularyEntry } from '@/features/vocabulary'

import {
  executeBulkVocabularyAvailabilityApply,
  VOCABULARY_BULK_UPDATE_CONCURRENCY,
} from './bulk-apply-vocabulary-availability.lib'

const fetchDisableMock = vi.mocked(fetchVocabularyDisableAvailability)
const updateMock = vi.mocked(updateVocabularyEntry)

const row = (id: string, status: 'active' | 'disabled' = 'active'): VocabularyOptionWithUsage => ({
  id,
  label: id,
  source: 'system',
  status,
  usedBy: 0,
})

describe('executeBulkVocabularyAvailabilityApply', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateMock.mockResolvedValue({ id: 'creature-types', options: [] })
    fetchDisableMock.mockResolvedValue({ status: 'allowed' })
  })

  it('updates rows that change status', async () => {
    const result = await executeBulkVocabularyAvailabilityApply({
      campaignId: 'camp_1',
      setId: 'creature-types',
      selectedRows: [row('a'), row('b', 'disabled')],
      status: 'disabled',
    })

    expect(result.updatedIds).toEqual(['a'])
    expect(result.blockedResults).toEqual([])
    expect(result.failedIds).toEqual([])
    expect(result.fullSuccess).toBe(true)
    expect(fetchDisableMock).toHaveBeenCalledTimes(1)
  })

  it('classifies preflight blockers separately from failures', async () => {
    fetchDisableMock.mockResolvedValueOnce({
      status: 'blocked',
      blockers: [
        {
          kind: 'content',
          contentTypeKey: 'species',
          id: 'sp_1',
          label: 'Elf',
          slug: 'elf',
        },
      ],
    })

    const result = await executeBulkVocabularyAvailabilityApply({
      campaignId: 'camp_1',
      setId: 'creature-types',
      selectedRows: [row('blocked-entry')],
      status: 'disabled',
    })

    expect(result.blockedResults).toEqual([
      {
        rowId: 'blocked-entry',
        label: 'blocked-entry',
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
    ])
    expect(result.failedIds).toEqual([])
    expect(result.hasBlocked).toBe(true)
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('classifies network errors as failedIds only', async () => {
    updateMock.mockRejectedValueOnce(new Error('network'))

    const result = await executeBulkVocabularyAvailabilityApply({
      campaignId: 'camp_1',
      setId: 'creature-types',
      selectedRows: [row('fail-entry')],
      status: 'disabled',
    })

    expect(result.failedIds).toEqual(['fail-entry'])
    expect(result.blockedResults).toEqual([])
    expect(result.hasFailed).toBe(true)
  })

  it('uses local concurrency constant', () => {
    expect(VOCABULARY_BULK_UPDATE_CONCURRENCY).toBe(5)
  })
})
