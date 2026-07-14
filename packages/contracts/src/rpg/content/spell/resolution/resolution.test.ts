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
  CHILL_TOUCH_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
} from './fixtures'
import {
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  spellResolutionEffectIdSchema,
  spellResolutionSchema,
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
      }).target.proximity,
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
})

describe('spell resolution formatters', () => {
  it('formats target proximity phrases and outcomes for scoped spells', () => {
    expect(formatResolutionTarget(ELDRITCH_BLAST_RESOLUTION)).toBe(
      'One creature or object within 120 feet',
    )
    expect(formatResolutionTargetProximityPhrase(INFlict_WOUNDS_RESOLUTION.target.proximity)).toBe(
      'you touch',
    )
    expect(formatResolutionTargetProximityPhrase(CHILL_TOUCH_RESOLUTION.target.proximity)).toBe(
      'within your reach',
    )
    expect(formatResolutionOutcomes(INFlict_WOUNDS_RESOLUTION)).toEqual([
      'Failed save: Full damage',
      'Successful save: Half damage',
    ])

    const summary = formatResolutionSummary(CHILL_TOUCH_RESOLUTION)
    expect(summary).toContain('Target')
    expect(summary).toContain('within your reach')
    expect(summary).toContain('Melee spell attack')
    expect(summary).toContain('1d10 Necrotic damage')
    expect(summary).toContain("can't regain Hit Points")
  })

  it('formats automatic healing and self proximity', () => {
    expect(formatResolutionTarget(CURE_WOUNDS_RESOLUTION)).toBe('One creature you touch')
    expect(formatResolutionMethod(CURE_WOUNDS_RESOLUTION)).toBe('Automatic')
    expect(formatResolutionSummary(CURE_WOUNDS_RESOLUTION)).toContain('2d8 healing')
    expect(formatResolutionOutcomes(CURE_WOUNDS_RESOLUTION)).toEqual(['Applied: Full healing'])
  })

  it('formats projectiles preview and effects application labels', () => {
    const pattern = MAGIC_MISSILE_RESOLUTION.applicationPattern
    expect(pattern?.kind).toBe('projectiles')
    if (pattern?.kind !== 'projectiles') return

    expect(formatResolutionProjectilesPreview(pattern)).toBe('Creates 3 darts.')
    expect(formatResolutionEffectsApplicationLabel(MAGIC_MISSILE_RESOLUTION)).toBe(
      'Applied per dart',
    )
    expect(formatResolutionEffectsApplicationLabel(ELDRITCH_BLAST_RESOLUTION)).toBe('Applied once')
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
      'Applied per projectile',
    )
  })
})
