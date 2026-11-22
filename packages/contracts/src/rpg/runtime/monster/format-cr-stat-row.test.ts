import { describe, expect, it } from 'vitest'

import { formatCrStatRow } from './format-cr-stat-row'

describe('formatCrStatRow', () => {
  it('formats CR 21 with grouped in-lair XP like the SRD lich line', () => {
    expect(
      formatCrStatRow({
        challengeRating: '21',
        experiencePoints: 33_000,
        proficiencyBonus: 7,
        inLairExperiencePoints: 41_000,
      }),
    ).toBe('21 (XP 33,000, or 41,000 in lair; PB +7)')
  })

  it('omits the in-lair clause when in-lair XP is absent', () => {
    expect(
      formatCrStatRow({
        challengeRating: '3',
        experiencePoints: 700,
        proficiencyBonus: 2,
      }),
    ).toBe('3 (XP 700; PB +2)')
  })
})
