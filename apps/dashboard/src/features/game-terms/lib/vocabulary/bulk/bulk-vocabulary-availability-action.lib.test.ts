import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ApiError } from '@rpg/contracts'

import {
  applyBulkVocabularyAvailabilityToTargets,
  validateBulkVocabularyAvailability,
  VOCABULARY_BULK_UPDATE_CONCURRENCY,
} from './bulk-vocabulary-availability-action.lib'

const fetchVocabularyDisableAvailabilityBatch = vi.fn()
const updateVocabularyEntry = vi.fn()

vi.mock('@/features/vocabulary', () => ({
  fetchVocabularyDisableAvailabilityBatch: (...args: unknown[]) =>
    fetchVocabularyDisableAvailabilityBatch(...args),
  updateVocabularyEntry: (...args: unknown[]) => updateVocabularyEntry(...args),
}))

const rows = [
  {
    id: 'entry-1',
    label: 'Acid',
    status: 'active' as const,
    source: 'system' as const,
    usedBy: 0,
  },
  {
    id: 'entry-2',
    label: 'Fire',
    status: 'active' as const,
    source: 'system' as const,
    usedBy: 0,
  },
]

describe('bulk-vocabulary-availability-action.lib', () => {
  beforeEach(() => {
    fetchVocabularyDisableAvailabilityBatch.mockReset()
  })

  it('uses one batch POST per validation pass when disable guard applies', async () => {
    fetchVocabularyDisableAvailabilityBatch.mockResolvedValue({
      targets: [
        {
          targetId: 'entry-1',
          targetName: 'Acid',
          availability: { status: 'allowed' },
        },
        {
          targetId: 'entry-2',
          targetName: 'Fire',
          availability: {
            status: 'blocked',
            blockers: [{ kind: 'usage', characterId: 'char-1', characterName: 'Aldric' }],
          },
        },
      ],
    })

    const validation = await validateBulkVocabularyAvailability(
      rows,
      'disabled',
      'campaign-1',
      'creature-types',
    )

    expect(fetchVocabularyDisableAvailabilityBatch).toHaveBeenCalledTimes(1)
    expect(fetchVocabularyDisableAvailabilityBatch).toHaveBeenCalledWith(
      'campaign-1',
      'creature-types',
      ['entry-1', 'entry-2'],
    )
    expect(validation.targets.filter((target) => target.status === 'blocked')).toHaveLength(1)
  })

  it('skips network calls when disable guard does not apply', async () => {
    const validation = await validateBulkVocabularyAvailability(
      rows,
      'disabled',
      'campaign-1',
      'damage-types',
    )

    expect(fetchVocabularyDisableAvailabilityBatch).not.toHaveBeenCalled()
    expect(validation.targets.every((target) => target.status === 'eligible')).toBe(true)
  })

  it('updates rows that change status', async () => {
    updateVocabularyEntry.mockResolvedValue({ id: 'creature-types', options: [] })

    const outcomes = await applyBulkVocabularyAvailabilityToTargets(
      [
        { id: 'a', label: 'A', status: 'active', source: 'system', usedBy: 0 },
        { id: 'b', label: 'B', status: 'disabled', source: 'system', usedBy: 0 },
      ],
      ['a'],
      'disabled',
      'campaign-1',
      'creature-types',
    )

    expect(outcomes).toEqual([{ status: 'updated', targetId: 'a' }])
  })

  it('classifies apply-time 409 blockers separately from failures', async () => {
    updateVocabularyEntry.mockRejectedValue(
      new ApiError(409, 'in_use', 'In use.', {
        blockers: [
          {
            kind: 'content',
            contentTypeKey: 'species',
            id: 'sp_1',
            label: 'Elf',
            slug: 'elf',
          },
        ],
      }),
    )

    const outcomes = await applyBulkVocabularyAvailabilityToTargets(
      [
        {
          id: 'blocked-entry',
          label: 'blocked-entry',
          status: 'active',
          source: 'system',
          usedBy: 0,
        },
      ],
      ['blocked-entry'],
      'disabled',
      'campaign-1',
      'creature-types',
    )

    expect(outcomes).toEqual([
      {
        status: 'blocked',
        targetId: 'blocked-entry',
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
  })

  it('classifies network errors as failed outcomes only', async () => {
    updateVocabularyEntry.mockRejectedValue(new Error('network'))

    const outcomes = await applyBulkVocabularyAvailabilityToTargets(
      [{ id: 'fail-entry', label: 'fail-entry', status: 'active', source: 'system', usedBy: 0 }],
      ['fail-entry'],
      'disabled',
      'campaign-1',
      'creature-types',
    )

    expect(outcomes).toEqual([
      {
        status: 'failed',
        targetId: 'fail-entry',
        failure: expect.objectContaining({ code: 'request_error' }),
      },
    ])
  })

  it('uses local concurrency constant', () => {
    expect(VOCABULARY_BULK_UPDATE_CONCURRENCY).toBe(5)
  })
})
