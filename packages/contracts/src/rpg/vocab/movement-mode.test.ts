import { describe, expect, it } from 'vitest'

import {
  EXTRA_MOVEMENT_MODES,
  MOVEMENT_MODES,
  MOVEMENT_MODE_ENTRIES,
  extraMovementModeSchema,
  formatMovementGrantAuthoringSummary,
  formatMovementGrantCompact,
  formatMovementGrantSentence,
  formatMovementDisplay,
  getMovementModeEntry,
  getMovementModeGrantLabel,
  getMovementModeLabel,
  getMovementOperationAuthoringLabel,
  movementGrantPayloadSchema,
  movementModeSchema,
  movementSpeedsSchema,
  resolveCreatureMovement,
} from './movement-mode'

describe('movementModeSchema', () => {
  it('accepts every known mode', () => {
    for (const mode of MOVEMENT_MODES) {
      expect(movementModeSchema.parse(mode)).toBe(mode)
    }
  })

  it('rejects unknown modes', () => {
    expect(movementModeSchema.safeParse('teleport').success).toBe(false)
    expect(movementModeSchema.safeParse('walk').success).toBe(true)
  })
})

describe('extraMovementModeSchema', () => {
  it('accepts every extra mode but not walk', () => {
    for (const mode of EXTRA_MOVEMENT_MODES) {
      expect(extraMovementModeSchema.parse(mode)).toBe(mode)
    }
    expect(extraMovementModeSchema.safeParse('walk').success).toBe(false)
  })
})

describe('movementSpeedsSchema', () => {
  it('accepts walk-only movement', () => {
    expect(movementSpeedsSchema.parse({ walk: 30 })).toEqual({ walk: 30 })
  })

  it('accepts multiple modes without requiring walk', () => {
    expect(movementSpeedsSchema.parse({ walk: 30, fly: 60 })).toEqual({ walk: 30, fly: 60 })
    expect(movementSpeedsSchema.parse({ fly: 60 })).toEqual({ fly: 60 })
  })

  it('rejects an empty movement map', () => {
    expect(movementSpeedsSchema.safeParse({}).success).toBe(false)
  })

  it('rejects unknown mode keys', () => {
    expect(movementSpeedsSchema.safeParse({ teleport: 30 }).success).toBe(false)
  })
})

describe('resolveCreatureMovement', () => {
  it('returns movement modes in canonical order', () => {
    expect(resolveCreatureMovement({ movement: { fly: 60, walk: 30 } })).toEqual({
      walk: 30,
      fly: 60,
    })
  })
})

describe('movement mode vocabulary', () => {
  it('derives MOVEMENT_MODES from the entry map', () => {
    expect([...MOVEMENT_MODES].sort()).toEqual(Object.keys(MOVEMENT_MODE_ENTRIES).sort())
  })

  it('derives EXTRA_MOVEMENT_MODES as all modes except walk', () => {
    expect([...EXTRA_MOVEMENT_MODES].sort()).toEqual(
      Object.keys(MOVEMENT_MODE_ENTRIES)
        .filter((mode) => mode !== 'walk')
        .sort(),
    )
  })

  it('has a label and description for every mode', () => {
    for (const mode of MOVEMENT_MODES) {
      const entry = getMovementModeEntry(mode)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getMovementModeLabel('fly')).toBe('Fly')
    expect(getMovementModeLabel('custom')).toBe('custom')
  })
})

describe('movement grant vocabulary', () => {
  it('parses movement grant payloads for each operation', () => {
    expect(
      movementGrantPayloadSchema.parse({
        mode: 'walk',
        operation: 'increase',
        feet: 5,
      }),
    ).toEqual({ mode: 'walk', operation: 'increase', feet: 5 })

    expect(
      movementGrantPayloadSchema.parse({
        mode: 'burrow',
        operation: 'set',
        feet: 20,
      }),
    ).toEqual({ mode: 'burrow', operation: 'set', feet: 20 })

    expect(
      movementGrantPayloadSchema.parse({
        mode: 'climb',
        operation: 'match',
        matchMode: 'walk',
      }),
    ).toEqual({ mode: 'climb', operation: 'match', matchMode: 'walk' })
  })

  it('rejects match grants where matchMode equals mode', () => {
    expect(
      movementGrantPayloadSchema.safeParse({
        mode: 'walk',
        operation: 'match',
        matchMode: 'walk',
      }).success,
    ).toBe(false)
  })

  it('formats movement grant display strings across tiers', () => {
    const increaseGrant = {
      mode: 'walk' as const,
      operation: 'increase' as const,
      feet: 5 as const,
    }
    expect(getMovementModeGrantLabel('walk')).toBe('Walking speed')
    expect(getMovementModeGrantLabel('fly')).toBe('Flying speed')
    expect(getMovementOperationAuthoringLabel('increase')).toBe('increases by')
    expect(formatMovementGrantCompact(increaseGrant)).toBe('Walk speed +5 ft')
    expect(formatMovementGrantSentence(increaseGrant)).toBe('Your walking speed increases by 5 ft.')
    expect(formatMovementGrantAuthoringSummary(increaseGrant)).toBe(
      "Character's walking speed increases by 5 ft.",
    )

    expect(formatMovementGrantCompact({ mode: 'burrow', operation: 'set', feet: 20 })).toBe(
      'Burrow speed 20 ft',
    )
    expect(formatMovementGrantSentence({ mode: 'burrow', operation: 'set', feet: 20 })).toBe(
      'You gain a burrowing speed of 20 ft.',
    )
    expect(
      formatMovementGrantCompact({ mode: 'climb', operation: 'match', matchMode: 'walk' }),
    ).toBe('Climb speed equal to Walk speed')
    expect(
      formatMovementGrantSentence({ mode: 'climb', operation: 'match', matchMode: 'walk' }),
    ).toBe('Your climbing speed equals your walking speed.')
  })
})

describe('formatMovementDisplay', () => {
  it('formats walk-only movement', () => {
    expect(formatMovementDisplay({ walk: 30 })).toBe('Walk 30 ft')
  })

  it('formats multiple modes in canonical order', () => {
    expect(formatMovementDisplay({ walk: 30, fly: 60, swim: 30 })).toBe(
      'Walk 30 ft, Fly 60 ft, Swim 30 ft',
    )
  })

  it('formats fly-only movement', () => {
    expect(formatMovementDisplay({ fly: 60 })).toBe('Fly 60 ft')
  })
})
