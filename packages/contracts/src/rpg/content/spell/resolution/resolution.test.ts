import { describe, expect, it } from 'vitest'

import { formatResolutionOutcomes, formatResolutionSummary, formatResolutionTarget } from './format'
import {
  CHILL_TOUCH_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
} from './fixtures'
import {
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  spellResolutionEffectIdSchema,
  spellResolutionSchema,
} from './schema'
import { spellResolutionValidationMessages } from './validation-messages'

describe('spellResolutionSchema', () => {
  it('accepts the three scoped spell fixtures', () => {
    for (const resolution of Object.values(SPELL_RESOLUTION_FIXTURES)) {
      expect(spellResolutionSchema.parse(resolution)).toEqual(resolution)
    }
  })

  it('defaults outcome applications to an empty array', () => {
    const parsed = spellResolutionSchema.parse({
      target: { count: 1, kind: 'creature' },
      method: { kind: 'attack', attackType: 'melee-spell' },
      range: { kind: 'touch' },
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
        target: { count: 1, kind: 'creature' },
        method: { kind: 'saving-throw', ability: 'wis' },
        range: { kind: 'touch' },
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

  it('accepts reach range with an optional explicit distance', () => {
    expect(
      spellResolutionSchema.parse({
        ...CHILL_TOUCH_RESOLUTION,
        range: { kind: 'reach', distance: { value: 10, unit: 'ft' } },
      }).range,
    ).toEqual({ kind: 'reach', distance: { value: 10, unit: 'ft' } })
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
  it('formats target, outcomes, and summary for scoped spells', () => {
    expect(formatResolutionTarget(ELDRITCH_BLAST_RESOLUTION)).toBe('One creature or object')
    expect(formatResolutionOutcomes(INFlict_WOUNDS_RESOLUTION)).toEqual([
      'Failed save: Full damage',
      'Successful save: Half damage',
    ])

    const summary = formatResolutionSummary(CHILL_TOUCH_RESOLUTION)
    expect(summary).toContain('Target')
    expect(summary).toContain('Melee spell attack')
    expect(summary).toContain('Range: Reach')
    expect(summary).toContain('1d10 Necrotic damage')
    expect(summary).toContain("can't regain Hit Points")
  })
})
