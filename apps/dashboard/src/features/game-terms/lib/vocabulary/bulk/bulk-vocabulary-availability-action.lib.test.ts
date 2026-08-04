import { describe, expect, it, vi, beforeEach } from 'vitest'

import { validateBulkVocabularyAvailability } from './bulk-vocabulary-availability-action.lib'

const fetchVocabularyDisableAvailabilityBatch = vi.fn()

vi.mock('@/features/vocabulary', () => ({
  fetchVocabularyDisableAvailabilityBatch: (...args: unknown[]) =>
    fetchVocabularyDisableAvailabilityBatch(...args),
  updateVocabularyEntry: vi.fn(),
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
})
