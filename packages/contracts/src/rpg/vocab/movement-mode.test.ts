import { describe, expect, it } from 'vitest'

import {
  EXTRA_MOVEMENT_MODES,
  MOVEMENT_MODES,
  extraMovementModeSchema,
  formatMovementGrantAuthoringSummary,
  formatMovementGrantCompact,
  formatMovementGrantMetadataDetail,
  formatMovementGrantSentence,
  formatMovementDisplay,
  movementAlternativeSchema,
  movementModeAvailability,
  getMovementModeEntry,
  getMovementModeGrantLabel,
  getMovementModeLabel,
  getMovementOperationAuthoringLabel,
  movementGrantPayloadSchema,
  movementModeSchema,
  movementSpeedsDraftSchema,
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

describe('movementSpeedsDraftSchema', () => {
  it('accepts an empty movement map', () => {
    expect(movementSpeedsDraftSchema.parse({})).toEqual({})
  })

  it('still validates mode keys when present', () => {
    expect(movementSpeedsDraftSchema.parse({ walk: 30 })).toEqual({ walk: 30 })
    expect(movementSpeedsDraftSchema.safeParse({ teleport: 30 }).success).toBe(false)
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
  it('derives EXTRA_MOVEMENT_MODES as all modes except walk', () => {
    expect([...EXTRA_MOVEMENT_MODES].sort()).toEqual(
      [...MOVEMENT_MODES].filter((mode) => mode !== 'walk').sort(),
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
    expect(formatMovementGrantMetadataDetail(increaseGrant)).toBe('Walk +5 ft')
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

  it('uses the stat-block abbreviation only when asked', () => {
    expect(formatMovementDisplay({ walk: 20, fly: 40 }, 'ft.')).toBe('Walk 20 ft., Fly 40 ft.')
    expect(formatMovementDisplay({ walk: 0 }, 'ft.')).toBe('Walk 0 ft.')
  })

  it('appends an unresolved alternative in movement-mode order for stat blocks', () => {
    const alternative = movementAlternativeSchema.parse({
      modes: ['fly', 'climb'],
      feet: 20,
    })
    expect(formatMovementDisplay({ walk: 20 }, 'ft.', alternative)).toBe(
      "20 ft., Fly or Climb 20 ft. (GM's choice)",
    )
    expect(formatMovementDisplay({ walk: 20, swim: 10 }, 'ft.', alternative)).toBe(
      "Walk 20 ft., Swim 10 ft., Fly or Climb 20 ft. (GM's choice)",
    )
  })

  it('leaves dashboard formatting unchanged when no alternative is present', () => {
    expect(formatMovementDisplay({ walk: 20, fly: 40 })).toBe('Walk 20 ft, Fly 40 ft')
  })
})

describe('movementAlternativeSchema', () => {
  it('accepts two or more distinct alternative modes', () => {
    expect(movementAlternativeSchema.parse({ modes: ['climb', 'fly'], feet: 20 })).toEqual({
      modes: ['climb', 'fly'],
      feet: 20,
    })
    expect(
      movementAlternativeSchema.parse({ modes: ['climb', 'fly', 'burrow'], feet: 20 }),
    ).toEqual({
      modes: ['climb', 'fly', 'burrow'],
      feet: 20,
    })
  })

  it('formats three alternatives in movement vocabulary order', () => {
    const alternative = movementAlternativeSchema.parse({
      modes: ['burrow', 'fly', 'climb'],
      feet: 20,
    })
    expect(formatMovementDisplay({ walk: 20 }, 'ft.', alternative)).toBe(
      "20 ft., Fly or Climb or Burrow 20 ft. (GM's choice)",
    )
  })

  it('rejects duplicate modes, fewer than two, empty objects, and bad feet', () => {
    expect(movementAlternativeSchema.safeParse({ modes: ['fly', 'fly'], feet: 20 }).success).toBe(
      false,
    )
    expect(movementAlternativeSchema.safeParse({ modes: ['fly'], feet: 20 }).success).toBe(false)
    expect(movementAlternativeSchema.safeParse({}).success).toBe(false)
    expect(movementAlternativeSchema.safeParse({ modes: ['climb', 'fly'], feet: 3 }).success).toBe(
      false,
    )
  })
})

describe('movementModeAvailability', () => {
  it('classifies fixed, alternative, and absent modes', () => {
    const definition = {
      movement: { walk: 20 },
      movementAlternative: movementAlternativeSchema.parse({ modes: ['climb', 'fly'], feet: 20 }),
    }
    expect(movementModeAvailability(definition, 'walk')).toBe('guaranteed')
    expect(movementModeAvailability(definition, 'climb')).toBe('alternative')
    expect(movementModeAvailability(definition, 'fly')).toBe('alternative')
    expect(movementModeAvailability(definition, 'swim')).toBe('absent')
  })
})
