import { describe, expect, it } from 'vitest'

import { suggestInLairExperience } from './suggest-in-lair-experience'

describe('suggestInLairExperience', () => {
  it('returns the next table XP through CR 29', () => {
    const expectXp = (rating: Parameters<typeof suggestInLairExperience>[0], xp: number) => {
      const result = suggestInLairExperience(rating)
      expect(result).toEqual({ status: 'available', experiencePoints: xp })
    }
    expectXp('10', 7200)
    expectXp('11', 8400)
    expectXp('24', 75000)
    expectXp('1/8', 50)
    expectXp('0', 25)
  })

  it('returns unavailable at CR 30', () => {
    expect(suggestInLairExperience('30')).toEqual({ status: 'unavailable' })
  })
})
