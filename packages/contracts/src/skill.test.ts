import { describe, expect, it } from 'vitest'
import { SKILLS, SKILL_IDS, skillSchema } from './skill'

describe('skillSchema', () => {
  it('covers all 18 SRD skills', () => {
    expect(SKILL_IDS).toHaveLength(18)
  })

  it('accepts every known skill id', () => {
    for (const id of SKILL_IDS) {
      expect(skillSchema.parse(id)).toBe(id)
    }
  })

  it('derives ids from the SKILLS map', () => {
    expect(SKILL_IDS).toEqual(Object.keys(SKILLS))
  })

  it('rejects display labels and unknown values', () => {
    expect(skillSchema.safeParse('Animal Handling').success).toBe(false)
    expect(skillSchema.safeParse('lockpicking').success).toBe(false)
  })
})
