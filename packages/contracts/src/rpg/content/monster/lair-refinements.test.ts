import { describe, expect, it } from 'vitest'

import {
  createMonsterDraftInputSchema,
  createMonsterInputSchema,
  monsterLairInLairXpMustExceedBaseMessage,
  MONSTER_LAIR_CUSTOM_XP_MESSAGE,
  resolveMonsterBaseExperiencePoints,
} from '../monster'
import { CHALLENGE_RATING_IDS, CHALLENGE_RATING_MECHANICS } from '../../vocab/challenge-rating'
import { suggestInLairExperience } from '../../runtime/monster/suggest-in-lair-experience'
import { MONSTER_TEST_BODY } from './test-fixtures'

function parsePublish(input: Record<string, unknown>) {
  return createMonsterInputSchema.safeParse({
    slug: 'lair-xp-publish',
    ...MONSTER_TEST_BODY,
    ...input,
  })
}

function parseDraft(input: Record<string, unknown>) {
  return createMonsterDraftInputSchema.safeParse({
    slug: 'lair-xp-draft',
    ...MONSTER_TEST_BODY,
    ...input,
  })
}

function issueOnPath(result: ReturnType<typeof createMonsterInputSchema.safeParse>, path: string) {
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path.join('.') === path)
}

describe('refineMonsterLair custom in-lair XP', () => {
  const base10 = CHALLENGE_RATING_MECHANICS['10'].xp

  it('rejects custom XP below or equal to normal XP at CR 10', () => {
    for (const value of [base10 - 1, base10]) {
      const result = parsePublish({
        challengeRating: '10',
        lair: { enabled: true, experience: { mode: 'custom', value } },
      })
      expect(result.success).toBe(false)
      const issue = issueOnPath(result, 'lair.experience.value')
      expect(issue?.message).toBe(monsterLairInLairXpMustExceedBaseMessage(base10))
    }
  })

  it('accepts custom XP above normal XP at CR 10', () => {
    expect(
      parsePublish({
        challengeRating: '10',
        lair: { enabled: true, experience: { mode: 'custom', value: 7200 } },
      }).success,
    ).toBe(true)
  })

  it('rejects custom XP below normal XP when value is another CRs suggested amount', () => {
    const base21 = CHALLENGE_RATING_MECHANICS['21'].xp
    const result = parsePublish({
      challengeRating: '21',
      lair: { enabled: true, experience: { mode: 'custom', value: 7200 } },
    })
    expect(result.success).toBe(false)
    const issue = issueOnPath(result, 'lair.experience.value')
    expect(issue?.message).toBe(monsterLairInLairXpMustExceedBaseMessage(base21))
  })

  it('uses experiencePointsOverride as normal XP at CR 0', () => {
    expect(
      parsePublish({
        challengeRating: '0',
        experiencePointsOverride: 0,
        lair: { enabled: true, experience: { mode: 'custom', value: 1 } },
      }).success,
    ).toBe(true)

    expect(
      parsePublish({
        challengeRating: '0',
        experiencePointsOverride: 0,
        lair: { enabled: true, experience: { mode: 'custom', value: 0 } },
      }).success,
    ).toBe(false)
  })

  it('requires a custom value on publish', () => {
    const result = parsePublish({
      challengeRating: '10',
      lair: { enabled: true, experience: { mode: 'custom' } },
    })
    expect(result.success).toBe(false)
    expect(issueOnPath(result, 'lair.experience.value')?.message).toBe(
      MONSTER_LAIR_CUSTOM_XP_MESSAGE,
    )
  })

  it('allows draft without custom XP value', () => {
    expect(
      parseDraft({
        challengeRating: '10',
        lair: { enabled: true, experience: { mode: 'custom' } },
      }).success,
    ).toBe(true)
  })

  it('ignores inactive lair with invalid custom XP', () => {
    expect(
      parsePublish({
        challengeRating: '21',
        lair: { enabled: false, experience: { mode: 'custom', value: 100 } },
      }).success,
    ).toBe(true)
  })

  it('compares custom XP against experiencePointsOverride instead of table XP', () => {
    const result = parsePublish({
      challengeRating: '0',
      experiencePointsOverride: 25,
      lair: { enabled: true, experience: { mode: 'custom', value: 25 } },
    })
    expect(result.success).toBe(false)
    expect(issueOnPath(result, 'lair.experience.value')?.message).toBe(
      monsterLairInLairXpMustExceedBaseMessage(25),
    )
  })
})

describe('suggestInLairExperience versus base XP', () => {
  it('returns suggested XP strictly greater than base for every CR with a suggestion', () => {
    for (const rating of CHALLENGE_RATING_IDS) {
      const baseXp = resolveMonsterBaseExperiencePoints({ challengeRating: rating })
      const suggestion = suggestInLairExperience(rating)
      if (suggestion.status === 'unavailable') continue
      expect(suggestion.experiencePoints).toBeGreaterThan(baseXp)
    }
  })

  it('marks CR 30 suggestions unavailable', () => {
    expect(suggestInLairExperience('30')).toEqual({ status: 'unavailable' })
  })
})
