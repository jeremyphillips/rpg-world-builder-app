import { describe, expect, it } from 'vitest'

import { DEFAULT_STANDARD_ARRAY } from '@rpg/contracts'
import {
  campaignLevelZeroNpcsPatchSchema,
  DEFAULT_LEVEL_ZERO_BASE_HIT_DIE,
  DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES,
  DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS,
  isSparseDefaultLevelZeroNpcsPatch,
  levelZeroArmorGrantSchema,
  levelZeroWeaponGrantSchema,
  normalizeCharacterWealthGrant,
  resolveLevelZeroNpcRules,
} from './campaign-level-zero-npcs-patch'

describe('resolveLevelZeroNpcRules', () => {
  it('applies defaults when no patch is stored', () => {
    expect(resolveLevelZeroNpcRules(undefined)).toEqual({
      enabled: true,
      baseHitDie: DEFAULT_LEVEL_ZERO_BASE_HIT_DIE,
      proficiencyBonus: DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS,
      retainSpeciesTraits: true,
      armorProficiencies: { categories: [], items: [] },
      weaponProficiencies: { categories: [], items: [] },
      languageProficiencies: DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES,
      retainSpeciesLanguages: true,
      startingWealth: undefined,
      standardArray: [...DEFAULT_STANDARD_ARRAY],
    })
  })

  it('merges partial overrides onto defaults', () => {
    const resolved = resolveLevelZeroNpcRules({
      proficiencyBonus: 0,
      armorProficiencies: { categories: ['light'], items: [] },
    })

    expect(resolved.proficiencyBonus).toBe(0)
    expect(resolved.armorProficiencies).toEqual({ categories: ['light'], items: [] })
    expect(resolved.weaponProficiencies).toEqual({ categories: [], items: [] })
    expect(resolved.languageProficiencies).toEqual(DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES)
  })

  it('returns stored subordinates when enabled is false', () => {
    const resolved = resolveLevelZeroNpcRules({
      enabled: false,
      baseHitDie: 8,
      proficiencyBonus: 1,
    })

    expect(resolved).toMatchObject({
      enabled: false,
      baseHitDie: 8,
      proficiencyBonus: 1,
    })
  })

  it('normalizes starting wealth with no positive coins to undefined', () => {
    expect(
      resolveLevelZeroNpcRules({ startingWealth: { cp: 0, gp: 0 } }).startingWealth,
    ).toBeUndefined()
    expect(resolveLevelZeroNpcRules({ startingWealth: { gp: 15 } }).startingWealth).toEqual({
      gp: 15,
    })
  })
})

describe('isSparseDefaultLevelZeroNpcsPatch', () => {
  it('is true for undefined and for patches that resolve to defaults', () => {
    expect(isSparseDefaultLevelZeroNpcsPatch(undefined)).toBe(true)
    expect(
      isSparseDefaultLevelZeroNpcsPatch({
        enabled: true,
        baseHitDie: DEFAULT_LEVEL_ZERO_BASE_HIT_DIE,
        proficiencyBonus: DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS,
      }),
    ).toBe(true)
  })

  it('is false when any value diverges from the default', () => {
    expect(isSparseDefaultLevelZeroNpcsPatch({ enabled: false })).toBe(false)
    expect(isSparseDefaultLevelZeroNpcsPatch({ proficiencyBonus: 0 })).toBe(false)
    expect(
      isSparseDefaultLevelZeroNpcsPatch({
        armorProficiencies: { categories: ['heavy'], items: [] },
      }),
    ).toBe(false)
    expect(
      isSparseDefaultLevelZeroNpcsPatch({
        languageProficiencies: { items: [], categories: [] },
      }),
    ).toBe(false)
  })
})

describe('campaignLevelZeroNpcsPatchSchema', () => {
  it('rejects unknown keys (strict)', () => {
    expect(campaignLevelZeroNpcsPatchSchema.safeParse({ foo: true }).success).toBe(false)
  })

  it('rejects proficiency bonus outside 0|1|2', () => {
    expect(campaignLevelZeroNpcsPatchSchema.safeParse({ proficiencyBonus: 3 }).success).toBe(false)
  })

  it('accepts heavy and martial armor categories', () => {
    expect(levelZeroArmorGrantSchema.safeParse({ categories: ['heavy'], items: [] }).success).toBe(
      true,
    )
    expect(
      levelZeroWeaponGrantSchema.safeParse({ categories: ['martial'], items: [] }).success,
    ).toBe(true)
  })

  it('rejects grant sets with both categories and items populated', () => {
    expect(
      levelZeroArmorGrantSchema.safeParse({
        categories: ['light'],
        items: ['longsword'],
      }).success,
    ).toBe(false)
    expect(
      levelZeroWeaponGrantSchema.safeParse({
        categories: ['simple'],
        items: ['dagger'],
      }).success,
    ).toBe(false)
  })

  it('allows empty language items', () => {
    expect(
      campaignLevelZeroNpcsPatchSchema.safeParse({
        languageProficiencies: { items: [], categories: [] },
      }).success,
    ).toBe(true)
  })
})

describe('normalizeCharacterWealthGrant', () => {
  it('returns undefined when no positive coin values remain', () => {
    expect(normalizeCharacterWealthGrant(undefined)).toBeUndefined()
    expect(normalizeCharacterWealthGrant({})).toBeUndefined()
    expect(normalizeCharacterWealthGrant({ cp: 0, gp: 0 })).toBeUndefined()
  })

  it('keeps only positive denominations', () => {
    expect(normalizeCharacterWealthGrant({ cp: 0, gp: 10, sp: 5 })).toEqual({ gp: 10, sp: 5 })
  })
})
