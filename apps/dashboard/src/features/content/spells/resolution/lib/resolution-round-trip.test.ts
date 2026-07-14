import { describe, expect, it } from 'vitest'

import {
  ARCANE_HAND_RESOLUTION,
  CHILL_TOUCH_RESOLUTION,
  CURE_WOUNDS_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  FALSE_LIFE_RESOLUTION,
  ICE_KNIFE_RESOLUTION,
  INFlict_WOUNDS_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
  SPELL_RESOLUTION_FIXTURES,
} from './resolution-fixtures'
import { resolutionFormSchema } from './resolution-form-schema'
import {
  resolutionToForm,
  resolutionToStored,
  spellResolutionFromFormValues,
} from './resolution-form-values'

const AUTHORING_FIXTURES = {
  'eldritch-blast': ELDRITCH_BLAST_RESOLUTION,
  'chill-touch': CHILL_TOUCH_RESOLUTION,
  'inflict-wounds': INFlict_WOUNDS_RESOLUTION,
  'cure-wounds': CURE_WOUNDS_RESOLUTION,
  'false-life': FALSE_LIFE_RESOLUTION,
  'ice-knife': ICE_KNIFE_RESOLUTION,
  'arcane-hand': ARCANE_HAND_RESOLUTION,
  'magic-missile': MAGIC_MISSILE_RESOLUTION,
} as const satisfies Partial<typeof SPELL_RESOLUTION_FIXTURES>

describe('spell resolution round trips', () => {
  for (const [slug, resolution] of Object.entries(AUTHORING_FIXTURES)) {
    it(`${slug}: contract resolution → form → stored → contract`, () => {
      const formValues = resolutionToForm(resolution)
      expect(formValues).toBeDefined()

      const stored = resolutionToStored(formValues)
      expect(stored).toEqual(resolution)
      expect(spellResolutionFromFormValues(formValues)).toEqual(resolution)
    })
  }

  it('eldritch-blast: preserves ranged attack distance range', () => {
    const formValues = resolutionToForm(ELDRITCH_BLAST_RESOLUTION)
    expect(formValues?.methodKind).toBe('attack')
    expect(formValues?.attackType).toBe('ranged-spell')
    expect(formValues?.proximityKind).toBe('distance')
    expect(formValues?.proximityDistanceFt).toBe(120)
  })

  it('chill-touch: preserves melee reach and hit outcome note', () => {
    const formValues = resolutionToForm(CHILL_TOUCH_RESOLUTION)
    expect(formValues?.attackType).toBe('melee-spell')
    expect(formValues?.proximityKind).toBe('reach')
    expect(formValues?.hitNote).toContain("can't regain Hit Points")
  })

  it('inflict-wounds: maps saving-throw preset without hit note', () => {
    const formValues = resolutionToForm(INFlict_WOUNDS_RESOLUTION)
    expect(formValues?.methodKind).toBe('saving-throw')
    expect(formValues?.saveAbility).toBe('con')
    expect(formValues?.hitNote).toBeUndefined()
  })

  it('cure-wounds: maps automatic healing effects array', () => {
    const formValues = resolutionToForm(CURE_WOUNDS_RESOLUTION)
    expect(formValues?.methodKind).toBe('automatic')
    expect(formValues?.effects).toHaveLength(1)
    expect(formValues?.effects[0]).toMatchObject({ kind: 'healing' })
  })

  it('ice-knife: preserves multi-effect outcomes from stored envelope', () => {
    const formValues = resolutionToForm(ICE_KNIFE_RESOLUTION)
    expect(formValues?.effects).toHaveLength(2)
    expect(resolutionToStored(formValues)).toEqual(ICE_KNIFE_RESOLUTION)
  })

  it('returns undefined when resolution is absent on the read model', () => {
    expect(resolutionToForm(undefined)).toBeUndefined()
    expect(resolutionToForm(null)).toBeUndefined()
    expect(resolutionToStored(undefined)).toBeUndefined()
  })

  it('returns undefined from stored normalization when effects are incomplete', () => {
    const formValues = resolutionToForm(ELDRITCH_BLAST_RESOLUTION)!
    expect(
      resolutionToStored({
        ...formValues,
        effects: [{ ...formValues.effects[0]!, damageType: undefined } as never],
      }),
    ).toBeUndefined()
  })

  it('parsed form schema round-trips through stored normalization for all fixtures', () => {
    for (const resolution of Object.values(AUTHORING_FIXTURES)) {
      const formValues = resolutionToForm(resolution)
      const parsedForm = resolutionFormSchema.parse(formValues)
      expect(resolutionToStored(parsedForm)).toEqual(resolution)
    }
  })

  it('magic-missile: preserves automatic method and projectiles application pattern', () => {
    const formValues = resolutionToForm(MAGIC_MISSILE_RESOLUTION)
    expect(formValues?.methodKind).toBe('automatic')
    expect(formValues?.applicationPatternKind).toBe('projectiles')
    expect(formValues?.projectileCount).toBe(3)
    expect(formValues?.projectileUnitLabelSingular).toBe('dart')
    expect(formValues?.projectileUnitLabelPlural).toBe('darts')
    expect(resolutionToStored(formValues)).toEqual(MAGIC_MISSILE_RESOLUTION)
  })

  it('omits applicationPattern when the form pattern kind is none', () => {
    const formValues = resolutionToForm(ELDRITCH_BLAST_RESOLUTION)!
    expect(formValues.applicationPatternKind).toBe('none')
    expect(resolutionToStored(formValues)?.applicationPattern).toBeUndefined()
  })

  it('clears applicationPattern when projectiles are removed in the form', () => {
    const formValues = resolutionToForm(MAGIC_MISSILE_RESOLUTION)!
    const cleared = {
      ...formValues,
      applicationPatternKind: 'none' as const,
      projectileCount: undefined,
      projectileUnitLabelSingular: undefined,
      projectileUnitLabelPlural: undefined,
    }
    const stored = resolutionToStored(cleared)
    expect(stored?.applicationPattern).toBeUndefined()
    expect(stored?.method.kind).toBe('automatic')
  })

  it('initializes projectiles defaults when adding the pattern in the form', () => {
    const formValues = resolutionToForm(ELDRITCH_BLAST_RESOLUTION)!
    const withProjectiles = {
      ...formValues,
      applicationPatternKind: 'projectiles' as const,
      projectileCount: 3,
      projectileUnitLabelSingular: 'projectile',
      projectileUnitLabelPlural: 'projectiles',
    }
    const stored = resolutionToStored(withProjectiles)
    expect(stored?.applicationPattern).toEqual({
      kind: 'projectiles',
      count: { type: 'fixed', value: 3 },
      unitLabel: { singular: 'projectile', plural: 'projectiles' },
      applicationMode: 'per-projectile',
    })
  })
})
