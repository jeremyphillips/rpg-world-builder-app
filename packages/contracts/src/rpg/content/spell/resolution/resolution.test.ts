import { describe, expect, it } from 'vitest'

import {
  formatResolutionEffectsApplicationLabel,
  formatResolutionMethod,
  formatResolutionOutcomes,
  formatResolutionProjectilesPreview,
  formatResolutionSummary,
  formatResolutionTarget,
  formatResolutionTargetProximityPhrase,
} from './format'
import {
  BURNING_HANDS_RESOLUTION,
  CHILL_TOUCH_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  FIREBALL_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
} from './fixtures'
import {
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  spellResolutionEffectIdSchema,
  spellResolutionSchema,
  SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
} from './schema'
import { spellResolutionValidationMessages } from './validation-messages'

describe('spellResolutionSchema', () => {
  it('accepts the scoped spell fixtures', () => {
    for (const resolution of Object.values(SPELL_RESOLUTION_FIXTURES)) {
      expect(spellResolutionSchema.parse(resolution)).toEqual(resolution)
    }
  })

  it('defaults outcome applications to an empty array', () => {
    const parsed = spellResolutionSchema.parse({
      selectionMode: 'targets',
      target: { count: 1, kind: 'creature', proximity: { kind: 'touch' } },
      method: { kind: 'attack', attackType: 'melee-spell' },
      effects: [
        {
          id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
          kind: 'damage',
          roll: { dice: { count: 1, faces: 4 } },
          damageType: 'bludgeoning',
        },
      ],
      outcomes: [
        {
          result: 'hit',
          note: 'The target is marked until the end of your next turn.',
        },
      ],
    })

    expect(parsed.outcomes[0]?.applications).toEqual([])
    expect(parsed.outcomes[0]?.note).toBe('The target is marked until the end of your next turn.')
  })

  it('accepts a saving-throw resolution with only a failed-save outcome', () => {
    expect(
      spellResolutionSchema.parse({
        selectionMode: 'targets',
        target: { count: 1, kind: 'creature', proximity: { kind: 'touch' } },
        method: { kind: 'saving-throw', ability: 'wis' },
        effects: [
          {
            id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
            kind: 'damage',
            roll: { dice: { count: 1, faces: 6 } },
            damageType: 'psychic',
          },
        ],
        outcomes: [
          {
            result: 'failed-save',
            applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
          },
        ],
      }),
    ).toMatchObject({
      outcomes: [{ result: 'failed-save' }],
    })
  })

  it('accepts reach proximity with an optional explicit distance', () => {
    expect(
      spellResolutionSchema.parse({
        ...CHILL_TOUCH_RESOLUTION,
        target: {
          ...CHILL_TOUCH_RESOLUTION.target,
          proximity: { kind: 'reach', distance: { value: 10, unit: 'ft' } },
        },
      }).target!.proximity,
    ).toEqual({ kind: 'reach', distance: { value: 10, unit: 'ft' } })
  })

  it('accepts automatic healing resolutions', () => {
    expect(spellResolutionSchema.parse(CURE_WOUNDS_RESOLUTION)).toEqual(CURE_WOUNDS_RESOLUTION)
  })

  it('rejects outcomes with neither applications nor note', () => {
    const result = spellResolutionSchema.safeParse({
      ...ELDRITCH_BLAST_RESOLUTION,
      outcomes: [{ result: 'hit' }],
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues.some((issue) => issue.message.includes('application'))).toBe(true)
  })

  it('rejects duplicate effect ids', () => {
    const duplicateId = spellResolutionEffectIdSchema.parse('damage')
    const result = spellResolutionSchema.safeParse({
      ...ELDRITCH_BLAST_RESOLUTION,
      effects: [
        {
          id: duplicateId,
          kind: 'damage',
          roll: { dice: { count: 1, faces: 10 } },
          damageType: 'force',
        },
        {
          id: duplicateId,
          kind: 'damage',
          roll: { dice: { count: 1, faces: 4 } },
          damageType: 'force',
        },
      ],
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['effects'],
        message: spellResolutionValidationMessages.duplicateEffectId(),
      }),
    )
  })

  it('rejects duplicate outcome results', () => {
    const result = spellResolutionSchema.safeParse({
      ...INFlict_WOUNDS_RESOLUTION,
      outcomes: [
        {
          result: 'failed-save',
          applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
        },
        {
          result: 'failed-save',
          applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'half' }],
        },
      ],
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['outcomes'],
        message: spellResolutionValidationMessages.duplicateOutcomeResult(),
      }),
    )
  })

  it('rejects unknown effect references', () => {
    const unknownId = spellResolutionEffectIdSchema.parse('missing')
    const result = spellResolutionSchema.safeParse({
      ...ELDRITCH_BLAST_RESOLUTION,
      outcomes: [
        {
          result: 'hit',
          applications: [{ effectId: unknownId, amount: 'full' }],
        },
      ],
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['outcomes', 0, 'applications', 0, 'effectId'],
        message: spellResolutionValidationMessages.unknownEffectReference({
          effectId: unknownId,
        }),
      }),
    )
  })

  it('rejects outcome results that do not match the resolution method', () => {
    const result = spellResolutionSchema.safeParse({
      ...ELDRITCH_BLAST_RESOLUTION,
      outcomes: [
        {
          result: 'failed-save',
          applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
        },
      ],
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['outcomes', 0, 'result'],
        message: spellResolutionValidationMessages.outcomeResultNotAllowedForMethod({
          result: 'failed-save',
        }),
      }),
    )
  })

  it('rejects creature-only effects for object targets', () => {
    const result = spellResolutionSchema.safeParse({
      selectionMode: 'targets',
      target: { count: 1, kind: 'object', proximity: { kind: 'touch' } },
      method: { kind: 'automatic' },
      effects: [
        {
          id: SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
          kind: 'healing',
          roll: { dice: { count: 2, faces: 8 } },
        },
      ],
      outcomes: [
        {
          result: 'applied',
          applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID, amount: 'full' }],
        },
      ],
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        path: ['effects', 0, 'kind'],
        message: spellResolutionValidationMessages.effectKindIncompatibleWithTarget({
          kind: 'healing',
          targetKind: 'object',
        }),
      }),
    )
  })
})

describe('spellResolutionSchema selection modes', () => {
  it('accepts self, targets, point, and none mode fixtures', () => {
    expect(spellResolutionSchema.parse(FALSE_LIFE_RESOLUTION)).toEqual(FALSE_LIFE_RESOLUTION)
    expect(spellResolutionSchema.parse(CURE_WOUNDS_RESOLUTION)).toEqual(CURE_WOUNDS_RESOLUTION)
    expect(spellResolutionSchema.parse(FIREBALL_RESOLUTION)).toEqual(FIREBALL_RESOLUTION)
    expect(spellResolutionSchema.parse(BURNING_HANDS_RESOLUTION)).toEqual(BURNING_HANDS_RESOLUTION)
  })

  it('rejects targets mode without target', () => {
    const result = spellResolutionSchema.safeParse({
      selectionMode: 'targets',
      method: { kind: 'automatic' },
      effects: ELDRITCH_BLAST_RESOLUTION.effects,
      outcomes: ELDRITCH_BLAST_RESOLUTION.outcomes,
    })

    expect(result.success).toBe(false)
  })

  it('rejects point mode without origin', () => {
    const result = spellResolutionSchema.safeParse({
      selectionMode: 'point',
      areaOfEffect: FIREBALL_RESOLUTION.areaOfEffect,
      method: FIREBALL_RESOLUTION.method,
      effects: FIREBALL_RESOLUTION.effects,
      outcomes: FIREBALL_RESOLUTION.outcomes,
    })

    expect(result.success).toBe(false)
  })

  it('strips target when selectionMode is self', () => {
    const parsed = spellResolutionSchema.parse({
      ...FALSE_LIFE_RESOLUTION,
      target: CURE_WOUNDS_RESOLUTION.target,
    })

    expect(parsed.selectionMode).toBe('self')
    expect(parsed.target).toBeUndefined()
  })

  it('strips areaOfEffect when selectionMode is none', () => {
    const parsed = spellResolutionSchema.parse({
      selectionMode: 'none',
      areaOfEffect: BURNING_HANDS_RESOLUTION.areaOfEffect,
      method: { kind: 'automatic' },
      effects: FALSE_LIFE_RESOLUTION.effects,
      outcomes: FALSE_LIFE_RESOLUTION.outcomes,
    })

    expect(parsed.selectionMode).toBe('none')
    expect(parsed.areaOfEffect).toBeUndefined()
  })

  it('rejects attack method for self mode without area', () => {
    const result = spellResolutionSchema.safeParse({
      selectionMode: 'self',
      method: { kind: 'attack', attackType: 'ranged-spell' },
      effects: ELDRITCH_BLAST_RESOLUTION.effects,
      outcomes: ELDRITCH_BLAST_RESOLUTION.outcomes,
    })

    expect(result.success).toBe(false)
  })

  it('rejects deferred attack method for point mode', () => {
    const result = spellResolutionSchema.safeParse({
      selectionMode: 'point',
      origin: FIREBALL_RESOLUTION.origin,
      areaOfEffect: FIREBALL_RESOLUTION.areaOfEffect,
      method: { kind: 'attack', attackType: 'ranged-spell' },
      effects: FIREBALL_RESOLUTION.effects,
      outcomes: FIREBALL_RESOLUTION.outcomes,
    })

    expect(result.success).toBe(false)
  })

  it('normalizes legacy target.self to selectionMode self', () => {
    const parsed = spellResolutionSchema.parse({
      target: {
        count: 1,
        kind: 'creature',
        proximity: { kind: 'self' },
      },
      method: { kind: 'automatic' },
      effects: FALSE_LIFE_RESOLUTION.effects,
      outcomes: FALSE_LIFE_RESOLUTION.outcomes,
    })

    expect(parsed.selectionMode).toBe('self')
    expect(parsed.target).toBeUndefined()
  })
})

describe('spell resolution formatters', () => {
  it('formats target proximity phrases and outcomes for scoped spells', () => {
    expect(formatResolutionTarget(ELDRITCH_BLAST_RESOLUTION)).toBe(
      'One creature or object within 120 feet',
    )
    expect(formatResolutionTargetProximityPhrase(INFlict_WOUNDS_RESOLUTION.target!.proximity)).toBe(
      'you touch',
    )
    expect(formatResolutionTargetProximityPhrase(CHILL_TOUCH_RESOLUTION.target!.proximity)).toBe(
      'within your reach',
    )
    expect(formatResolutionOutcomes(INFlict_WOUNDS_RESOLUTION)).toEqual([
      'Failed save: Target takes 2d10 necrotic damage.',
      'Successful save: Target takes half as much damage.',
    ])

    const summary = formatResolutionSummary(CHILL_TOUCH_RESOLUTION)
    expect(summary).toContain('Target')
    expect(summary).toContain('within your reach')
    expect(summary).toContain('Melee spell attack')
    expect(summary).toContain('Target takes 1d10 necrotic damage')
    expect(summary).toContain("can't regain Hit Points")
  })

  it('formats automatic healing and self recipient preview', () => {
    expect(formatResolutionTarget(CURE_WOUNDS_RESOLUTION)).toBe('One creature you touch')
    expect(formatResolutionMethod(CURE_WOUNDS_RESOLUTION)).toBe('Automatic')
    expect(formatResolutionMethod(CURE_WOUNDS_RESOLUTION, 'resolution-preview')).toBe(
      'No check required',
    )
    expect(formatResolutionSummary(CURE_WOUNDS_RESOLUTION)).toContain(
      'Target regains 2d8 hit points',
    )
    expect(formatResolutionOutcomes(CURE_WOUNDS_RESOLUTION)).toEqual([
      'Applied: Target regains 2d8 hit points.',
    ])
    expect(formatResolutionSummary(FALSE_LIFE_RESOLUTION)).toContain('Recipient')
    expect(formatResolutionSummary(FALSE_LIFE_RESOLUTION)).toContain(
      'You gain 2d4+4 temporary hit points',
    )
  })

  it('formats projectiles preview and effects application labels', () => {
    const pattern = MAGIC_MISSILE_RESOLUTION.applicationPattern
    expect(pattern?.kind).toBe('projectiles')
    if (pattern?.kind !== 'projectiles') return

    expect(formatResolutionProjectilesPreview(pattern)).toBe('Creates 3 darts.')
    expect(formatResolutionEffectsApplicationLabel(MAGIC_MISSILE_RESOLUTION)).toBe(
      'Applied once per dart',
    )
    expect(formatResolutionEffectsApplicationLabel(ELDRITCH_BLAST_RESOLUTION)).toBe(
      'Applied once per beam',
    )
    expect(formatResolutionSummary(MAGIC_MISSILE_RESOLUTION)).toContain('Creates 3 darts.')
  })

  it('uses generic projectile copy when unit labels are absent', () => {
    const pattern = {
      kind: 'projectiles' as const,
      count: { type: 'fixed' as const, value: 2 },
      applicationMode: 'per-projectile' as const,
    }

    expect(formatResolutionProjectilesPreview(pattern)).toBe('Creates 2 projectiles.')
    expect(formatResolutionEffectsApplicationLabel({ applicationPattern: pattern })).toBe(
      'Applied once per projectile',
    )
  })
})
