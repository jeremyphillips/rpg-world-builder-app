import { describe, expect, it } from 'vitest'

import {
  EXTRA_MOVEMENT_MODES,
  MOVEMENT_MODES,
  MOVEMENT_MODE_ENTRIES,
  extraMovementModeSchema,
  formatMovementBonusAuthoringSummary,
  formatMovementBonusDescription,
  formatMovementBonusTitle,
  formatSpeed,
  getMovementModeEntry,
  getMovementModeGrantLabel,
  getMovementModeLabel,
  movementGrantPayloadSchema,
  movementModeSchema,
  speedSchema,
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

describe('speedSchema', () => {
  it('accepts walk-only speed', () => {
    expect(speedSchema.parse({ walk: 30 })).toEqual({ walk: 30 })
  })

  it('accepts walk plus extra modes', () => {
    expect(
      speedSchema.parse({
        walk: 30,
        modes: [
          { mode: 'fly', feet: 60 },
          { mode: 'swim', feet: 30 },
        ],
      }),
    ).toEqual({
      walk: 30,
      modes: [
        { mode: 'fly', feet: 60 },
        { mode: 'swim', feet: 30 },
      ],
    })
  })

  it('rejects missing walk', () => {
    expect(speedSchema.safeParse({ modes: [{ mode: 'fly', feet: 60 }] }).success).toBe(false)
  })

  it('rejects walk in modes array', () => {
    expect(speedSchema.safeParse({ walk: 30, modes: [{ mode: 'walk', feet: 30 }] }).success).toBe(
      false,
    )
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
  it('parses movement grant payloads', () => {
    expect(
      movementGrantPayloadSchema.parse({
        mode: 'walk',
        operation: 'bonus',
        value: 5,
        unit: 'ft',
      }),
    ).toEqual({ mode: 'walk', operation: 'bonus', value: 5, unit: 'ft' })
  })

  it('formats movement bonus display strings', () => {
    const grant = { mode: 'walk' as const, operation: 'bonus' as const, value: 5 as const, unit: 'ft' as const }
    expect(getMovementModeGrantLabel('walk')).toBe('Walking speed')
    expect(formatMovementBonusTitle(grant)).toBe('+5 ft walking speed')
    expect(formatMovementBonusDescription(grant)).toBe('Your walking speed increases by 5 feet.')
    expect(formatMovementBonusAuthoringSummary(grant)).toBe(
      "Character's walking speed increases by 5 ft.",
    )
  })
})

describe('formatSpeed', () => {
  it('formats walk-only speed', () => {
    expect(formatSpeed({ walk: 30 })).toBe('30 ft.')
  })

  it('formats walk plus extra modes', () => {
    expect(
      formatSpeed({
        walk: 30,
        modes: [
          { mode: 'fly', feet: 60 },
          { mode: 'swim', feet: 30 },
        ],
      }),
    ).toBe('30 ft., Fly 60 ft., Swim 30 ft.')
  })
})
