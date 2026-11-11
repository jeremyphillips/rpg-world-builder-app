import { describe, expect, it } from 'vitest'

import { createMonsterDraftInputSchema, createMonsterInputSchema } from '../monster'
import { MONSTER_TEST_BODY } from './test-fixtures'

describe('monsterBodySchema refinements', () => {
  it('rejects duplicate action ids across sections', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'dup-actions',
        ...MONSTER_TEST_BODY,
        actions: [{ id: 'shared', kind: 'special', name: 'A', description: 'a' }],
        reactions: [
          { id: 'shared', kind: 'special', name: 'B', description: 'b', trigger: { text: 't' } },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects legacy communication.languages on create input', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'legacy-languages',
        ...MONSTER_TEST_BODY,
        communication: { languages: { entries: [{ language: 'common' }] } },
      }).success,
    ).toBe(false)
  })

  it('allows CR 0 XP override only when different from derived', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'cr-zero-override',
        ...MONSTER_TEST_BODY,
        experiencePointsOverride: 0,
      }).success,
    ).toBe(true)

    expect(
      createMonsterInputSchema.safeParse({
        slug: 'xp-override-blocked',
        ...MONSTER_TEST_BODY,
        challengeRating: '1/8',
        experiencePointsOverride: 0,
      }).success,
    ).toBe(false)
  })

  it('rejects overlapping damage defenses on publish and allows them on a draft', () => {
    const defenses = {
      vulnerabilities: [],
      resistances: ['fire'],
      immunities: ['fire', 'poison'],
      conditionImmunities: ['poisoned'],
    }
    const published = createMonsterInputSchema.safeParse({
      slug: 'overlap',
      ...MONSTER_TEST_BODY,
      defenses,
    })
    expect(published.success).toBe(false)
    if (!published.success) {
      expect(
        published.error.issues.some((issue) =>
          issue.message.includes('Fire is already a resistance'),
        ),
      ).toBe(true)
    }
    expect(
      createMonsterDraftInputSchema.safeParse({
        slug: 'overlap',
        ...MONSTER_TEST_BODY,
        defenses,
      }).success,
    ).toBe(true)
  })
})
