import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from './character-builder-fixtures'
import { formatAbilityMethodLabel, resolveReviewReadyMessage } from './review-step-display'

describe('review-step-display', () => {
  const context = createStandaloneBuilderContextFixture()

  it('formats ability method labels', () => {
    expect(formatAbilityMethodLabel('manual')).toBe('Manual entry')
    expect(formatAbilityMethodLabel('standard-array')).toBe('Standard array')
    expect(formatAbilityMethodLabel(undefined)).toBe('Not set')
  })

  it('returns a ready message when validation passes', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', alignment: 'ng' as const },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }

    expect(resolveReviewReadyMessage(draft, context, [], [])).toBe(
      'Your character is ready to create.',
    )
  })
})
