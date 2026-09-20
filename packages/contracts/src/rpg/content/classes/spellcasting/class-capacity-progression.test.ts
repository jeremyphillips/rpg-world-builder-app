import { describe, expect, it } from 'vitest'

import { resolveClassCantripCount } from '../../../runtime/creature/spellcasting'
import { classCapacityProgressionSchema } from './class-capacity-progression'
import { spellcastingSchema } from './spellcasting'

describe('classCapacityProgressionSchema', () => {
  it('requires at least one breakpoint when cantrips are present', () => {
    expect(
      classCapacityProgressionSchema.safeParse({
        curve: { rows: [] },
        extension: 'carryForward',
      }).success,
    ).toBe(false)
  })

  it('rejects equal or decreasing counts across breakpoints', () => {
    expect(
      classCapacityProgressionSchema.safeParse({
        curve: {
          rows: [
            { level: 1, count: 3 },
            { level: 4, count: 3 },
          ],
        },
      }).success,
    ).toBe(false)

    expect(
      classCapacityProgressionSchema.safeParse({
        curve: {
          rows: [
            { level: 1, count: 4 },
            { level: 4, count: 3 },
          ],
        },
      }).success,
    ).toBe(false)
  })

  it('accepts strictly increasing sparse breakpoints', () => {
    expect(
      classCapacityProgressionSchema.safeParse({
        curve: {
          rows: [
            { level: 1, count: 2 },
            { level: 4, count: 3 },
            { level: 10, count: 4 },
          ],
        },
      }).success,
    ).toBe(true)
  })
})

describe('resolveClassCantripCount', () => {
  const bardSpellcasting = spellcastingSchema.parse({
    slotProgressionId: 'full-caster',
    ability: 'cha',
    spellSelection: {
      model: 'limitedRepertoire',
      change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
    },
    progression: {
      cantrips: {
        curve: {
          rows: [
            { level: 1, count: 2 },
            { level: 4, count: 3 },
            { level: 10, count: 4 },
          ],
        },
      },
      repertoire: {
        curve: { rows: [{ level: 1, count: 4 }] },
      },
    },
  })

  it('carry-forwards bard cantrip counts by level', () => {
    expect(resolveClassCantripCount({ spellcasting: bardSpellcasting, classLevel: 1 })).toBe(2)
    expect(resolveClassCantripCount({ spellcasting: bardSpellcasting, classLevel: 3 })).toBe(2)
    expect(resolveClassCantripCount({ spellcasting: bardSpellcasting, classLevel: 4 })).toBe(3)
    expect(resolveClassCantripCount({ spellcasting: bardSpellcasting, classLevel: 9 })).toBe(3)
    expect(resolveClassCantripCount({ spellcasting: bardSpellcasting, classLevel: 10 })).toBe(4)
    expect(resolveClassCantripCount({ spellcasting: bardSpellcasting, classLevel: 20 })).toBe(4)
  })

  it('returns 0 before spellcasting unlock or when cantrips are absent', () => {
    const delayed = spellcastingSchema.parse({
      slotProgressionId: 'full-caster',
      ability: 'cha',
      level: 2,
      spellSelection: {
        model: 'limitedRepertoire',
        change: { kind: 'replace', trigger: 'levelUp', limit: 1 },
      },
      progression: {
        cantrips: {
          curve: { rows: [{ level: 2, count: 2 }] },
        },
        repertoire: {
          curve: { rows: [{ level: 2, count: 4 }] },
        },
      },
    })

    expect(resolveClassCantripCount({ spellcasting: delayed, classLevel: 1 })).toBe(0)

    const withoutCantrips = spellcastingSchema.parse({
      slotProgressionId: 'half-caster',
      ability: 'cha',
      spellSelection: {
        model: 'prepareFromClassList',
        change: { kind: 'replace', trigger: 'longRest', limit: 1 },
      },
      progression: {
        preparedSpells: {
          curve: { rows: [{ level: 1, count: 2 }] },
        },
      },
    })
    expect(resolveClassCantripCount({ spellcasting: withoutCantrips, classLevel: 5 })).toBe(0)
  })
})
