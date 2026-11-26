import { describe, expect, it } from 'vitest'

import {
  createMonsterDraftInputSchema,
  createMonsterInputSchema,
  updateMonsterDraftInputSchema,
  updateMonsterInputSchema,
} from '../monster'
import { MONSTER_TEST_BODY } from './test-fixtures'

function parsePublish(overrides: Record<string, unknown> = {}) {
  return createMonsterInputSchema.safeParse({
    slug: 'movement-alt-publish',
    ...MONSTER_TEST_BODY,
    ...overrides,
  })
}

function parseDraft(overrides: Record<string, unknown> = {}) {
  return createMonsterDraftInputSchema.safeParse({
    slug: 'movement-alt-draft',
    ...MONSTER_TEST_BODY,
    ...overrides,
  })
}

describe('monster movementAlternative', () => {
  it('parses a valid alternative on published and draft monsters', () => {
    const alternative = { movementAlternative: { modes: ['climb', 'fly'], feet: 20 } }
    expect(parsePublish(alternative).success).toBe(true)
    expect(parseDraft(alternative).success).toBe(true)
    expect(
      parsePublish({ movementAlternative: { modes: ['climb', 'fly', 'burrow'], feet: 20 } })
        .success,
    ).toBe(true)
  })

  it('rejects a single alternative mode on publish', () => {
    expect(parsePublish({ movementAlternative: { modes: ['fly'], feet: 20 } }).success).toBe(false)
  })

  it('rejects overlap between fixed movement and the alternative', () => {
    expect(
      parsePublish({
        movement: { walk: 20, climb: 10 },
        movementAlternative: { modes: ['climb', 'fly'], feet: 20 },
      }).success,
    ).toBe(false)
  })

  it('keeps legacy movement-only documents valid', () => {
    expect(parsePublish().success).toBe(true)
  })

  it('accepts null movementAlternative tombstones on monster update inputs', () => {
    expect(
      updateMonsterInputSchema.safeParse({ movementAlternative: null, slug: 'swarm' }).success,
    ).toBe(true)
    expect(
      updateMonsterDraftInputSchema.safeParse({ movementAlternative: null, slug: 'swarm' }).success,
    ).toBe(true)
  })

  it('rejects a persisted-shaped object with a single alternative mode on update', () => {
    expect(
      updateMonsterInputSchema.safeParse({
        movementAlternative: { modes: ['fly'], feet: 20 },
        slug: 'swarm',
      }).success,
    ).toBe(false)
  })
})
