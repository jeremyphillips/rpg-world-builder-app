import { describe, expect, it } from 'vitest'

import {
  ABSOLUTE_MAX_CHARACTER_LEVEL,
  buildGroupedLevelOptions,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  defaultExtendedMaxLevel,
  formatExtendedLevelRange,
  formatStandardLevelRange,
  MAX_CHARACTER_LEVEL,
  resolveAllowedCharacterCreatureTypes,
  resolveAllowedCreatureTypesFromPolicy,
  resolveCampaignRules,
  resolveMaxCharacterLevel,
  resolveStandardMaxCharacterLevel,
  validateExtendedMaxLevel,
} from '@rpg/contracts'

const defaultCreatureTypes = [...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES]

const basePatch = {
  startingLevel: 1,
  importedCharacters: { policy: 'disabled' as const },
}

describe('resolveStandardMaxCharacterLevel', () => {
  it('defaults to system max when override is absent', () => {
    expect(resolveStandardMaxCharacterLevel(undefined)).toBe(MAX_CHARACTER_LEVEL)
    expect(resolveStandardMaxCharacterLevel(basePatch)).toBe(MAX_CHARACTER_LEVEL)
  })

  it('returns sparse override when set', () => {
    expect(
      resolveStandardMaxCharacterLevel({
        ...basePatch,
        progression: { maxCharacterLevel: 25 },
      }),
    ).toBe(25)
  })
})

describe('resolveMaxCharacterLevel', () => {
  it('defaults to system max when override is absent', () => {
    expect(resolveMaxCharacterLevel(undefined)).toBe(MAX_CHARACTER_LEVEL)
    expect(resolveMaxCharacterLevel(basePatch)).toBe(MAX_CHARACTER_LEVEL)
  })

  it('returns flat override when extended progression is absent', () => {
    expect(
      resolveMaxCharacterLevel({
        ...basePatch,
        progression: { maxCharacterLevel: 25 },
      }),
    ).toBe(25)
  })

  it('returns extended max when extended progression is present', () => {
    expect(
      resolveMaxCharacterLevel({
        ...basePatch,
        progression: {
          maxCharacterLevel: 20,
          extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
        },
      }),
    ).toBe(30)
  })
})

describe('resolveAllowedCreatureTypesFromPolicy', () => {
  it('defaults to humanoid when policy is absent', () => {
    expect(resolveAllowedCreatureTypesFromPolicy(undefined)).toEqual(['humanoid'])
  })

  it('returns ids when mode is only', () => {
    expect(
      resolveAllowedCreatureTypesFromPolicy({
        mode: 'only',
        ids: ['humanoid', 'fey'],
      }),
    ).toEqual(['humanoid', 'fey'])
  })
})

describe('resolveAllowedCharacterCreatureTypes', () => {
  it('defaults to humanoid when policy is absent', () => {
    expect(resolveAllowedCharacterCreatureTypes(undefined)).toEqual(['humanoid'])
    expect(resolveAllowedCharacterCreatureTypes(basePatch)).toEqual(['humanoid'])
  })

  it('returns policy ids when set', () => {
    expect(
      resolveAllowedCharacterCreatureTypes({
        ...basePatch,
        species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'fey'] } },
      }),
    ).toEqual(['humanoid', 'fey'])
  })
})

describe('resolveCampaignRules', () => {
  it('returns flat cap without extended metadata', () => {
    expect(
      resolveCampaignRules({
        ...basePatch,
        progression: { maxCharacterLevel: 25 },
      }),
    ).toEqual({
      maxCharacterLevel: 25,
      standardMaxCharacterLevel: 25,
      allowedCharacterCreatureTypes: defaultCreatureTypes,
    })
  })

  it('returns extended progression metadata when enabled', () => {
    expect(
      resolveCampaignRules({
        ...basePatch,
        progression: {
          maxCharacterLevel: 20,
          extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
        },
      }),
    ).toEqual({
      maxCharacterLevel: 30,
      standardMaxCharacterLevel: 20,
      allowedCharacterCreatureTypes: defaultCreatureTypes,
      extendedProgression: {
        tierName: 'Epic Destiny',
        startsAt: 21,
        maxLevel: 30,
      },
    })
  })

  it('returns creature type policy ids when set', () => {
    expect(
      resolveCampaignRules({
        ...basePatch,
        species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'construct'] } },
      }).allowedCharacterCreatureTypes,
    ).toEqual(['humanoid', 'construct'])
  })

  it('supports absolute max at 100', () => {
    expect(
      resolveCampaignRules({
        ...basePatch,
        progression: { maxCharacterLevel: ABSOLUTE_MAX_CHARACTER_LEVEL },
      }).maxCharacterLevel,
    ).toBe(ABSOLUTE_MAX_CHARACTER_LEVEL)
  })
})

describe('validateExtendedMaxLevel', () => {
  it('rejects equal standard and extended max', () => {
    expect(validateExtendedMaxLevel(30, 30)).toEqual({
      valid: false,
      message: 'Extended maximum level must be higher than the standard maximum level.',
    })
  })

  it('returns specific minimum message when extended max is too low', () => {
    expect(validateExtendedMaxLevel(20, 15)).toEqual({
      valid: false,
      message: 'Extended maximum must be at least 21 because the standard maximum is 20.',
    })
  })

  it('accepts valid extended max', () => {
    expect(validateExtendedMaxLevel(20, 30)).toEqual({ valid: true })
  })
})

describe('formatStandardLevelRange', () => {
  it('formats a simple standard range', () => {
    expect(formatStandardLevelRange(20)).toBe('Range: 1–20')
    expect(formatStandardLevelRange(30)).toBe('Range: 1–30')
  })
})

describe('formatExtendedLevelRange', () => {
  it('formats the combined inline range with a tier name', () => {
    expect(
      formatExtendedLevelRange({
        maxCharacterLevel: 20,
        extendedTierName: 'Epic Destiny',
        extendedMaxLevel: 30,
      }),
    ).toBe('Range: 1–20 standard · 21–30 Epic Destiny')
  })

  it('uses a placeholder when tier name is empty', () => {
    expect(
      formatExtendedLevelRange({
        maxCharacterLevel: 20,
        extendedMaxLevel: 30,
      }),
    ).toBe('Range: 1–20 standard · 21–30 extended')
  })
})

describe('defaultExtendedMaxLevel', () => {
  it('adds default offset capped at absolute max', () => {
    expect(defaultExtendedMaxLevel(20)).toBe(30)
    expect(defaultExtendedMaxLevel(95)).toBe(100)
  })
})

describe('buildGroupedLevelOptions', () => {
  it('returns flat group when extended progression is absent', () => {
    const groups = buildGroupedLevelOptions({
      maxCharacterLevel: 20,
      standardMaxCharacterLevel: 20,
      allowedCharacterCreatureTypes: defaultCreatureTypes,
    })
    expect(groups).toHaveLength(1)
    expect(groups[0]?.options).toHaveLength(20)
  })

  it('returns standard and extended groups when extended progression is active', () => {
    const groups = buildGroupedLevelOptions({
      maxCharacterLevel: 30,
      standardMaxCharacterLevel: 20,
      allowedCharacterCreatureTypes: defaultCreatureTypes,
      extendedProgression: {
        tierName: 'Epic Destiny',
        startsAt: 21,
        maxLevel: 30,
      },
    })
    expect(groups).toHaveLength(2)
    expect(groups[0]?.options).toHaveLength(20)
    expect(groups[1]?.options).toHaveLength(10)
    expect(groups[1]?.label).toContain('Epic Destiny Tier')
  })
})
