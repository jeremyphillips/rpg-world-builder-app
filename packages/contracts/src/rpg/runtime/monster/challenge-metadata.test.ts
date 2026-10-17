import { describe, expect, it } from 'vitest'

import { formatMonsterChallengeMetadata } from './challenge-metadata'

describe('formatMonsterChallengeMetadata', () => {
  it('joins XP and PB with a middle dot', () => {
    expect(formatMonsterChallengeMetadata({ experiencePoints: 200, proficiencyBonus: 2 })).toBe(
      'XP 200 · PB +2',
    )
  })
})
