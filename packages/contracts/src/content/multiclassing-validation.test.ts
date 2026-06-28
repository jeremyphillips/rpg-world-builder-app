import { describe, expect, it } from 'vitest'

import { resolveMulticlassingRules } from '../platform/campaign-multiclassing-patch'
import {
  validateMulticlass,
  type MulticlassingRulesInput,
  type ValidateMulticlassInput,
} from './multiclassing-validation'

const ABILITIES_13 = { str: 13, dex: 13, con: 13, int: 13, wis: 13, cha: 13 }
const ABILITIES_10 = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }

function rules(overrides?: Partial<Parameters<typeof resolveMulticlassingRules>[0]>) {
  return resolveMulticlassingRules(overrides)
}

function baseInput(overrides: Partial<ValidateMulticlassInput> = {}): ValidateMulticlassInput {
  return {
    rules: rules(),
    targetClass: { slug: 'wizard', primaryAbilities: ['int'] },
    currentClasses: [{ slug: 'fighter', primaryAbilities: ['str'], level: 3 }],
    abilityScores: ABILITIES_13,
    ...overrides,
  }
}

// Compile-time guarantee that the platform resolved shape satisfies the structural input.
const _assignable: MulticlassingRulesInput = resolveMulticlassingRules(undefined)
void _assignable

describe('validateMulticlass — enablement', () => {
  it('blocks when multiclassing is disabled', () => {
    const result = validateMulticlass(baseInput({ rules: rules({ enabled: false }) }))
    expect(result.ok).toBe(false)
    expect(result.errors).toEqual([expect.objectContaining({ code: 'multiclassing_disabled' })])
  })

  it('passes with defaults when all primary abilities meet the minimum', () => {
    expect(validateMulticlass(baseInput()).ok).toBe(true)
  })
})

describe('validateMulticlass — primary ability minimum', () => {
  it('requires every primary ability across target and current classes (all semantics)', () => {
    const result = validateMulticlass(
      baseInput({
        abilityScores: { ...ABILITIES_13, str: 12 }, // fails fighter's STR requirement
      }),
    )
    expect(result.ok).toBe(false)
    expect(result.errors).toEqual([
      expect.objectContaining({ code: 'primary_ability_minimum', ability: 'str' }),
    ])
  })

  it('emits one error per failing required ability, de-duplicated', () => {
    const result = validateMulticlass(
      baseInput({
        targetClass: { slug: 'ranger', primaryAbilities: ['dex', 'wis'] },
        currentClasses: [{ slug: 'fighter', primaryAbilities: ['str'], level: 1 }],
        abilityScores: ABILITIES_10,
      }),
    )
    expect(result.ok).toBe(false)
    expect(result.errors.map((e) => e.ability).sort()).toEqual(['dex', 'str', 'wis'])
  })

  it('skips the check when the requirement is disabled', () => {
    const result = validateMulticlass(
      baseInput({
        rules: rules({ requirements: { primaryAbilityMinimum: { enabled: false } } }),
        abilityScores: ABILITIES_10,
      }),
    )
    expect(result.ok).toBe(true)
  })

  it('honors a custom minimum score', () => {
    const result = validateMulticlass(
      baseInput({
        rules: rules({ requirements: { primaryAbilityMinimum: { minimumScore: 15 } } }),
      }),
    )
    expect(result.ok).toBe(false)
  })
})

describe('validateMulticlass — species policy', () => {
  const policyRules = rules({ requirements: { speciesPolicy: { enabled: true } } })

  it('ignores species policy unless the requirement is enabled', () => {
    const result = validateMulticlass(
      baseInput({
        species: {
          multiclassing: { policy: 'forbidden', classPolicy: { mode: 'all', classIds: [] } },
        },
      }),
    )
    expect(result.ok).toBe(true)
  })

  it('blocks a forbidden species', () => {
    const result = validateMulticlass(
      baseInput({
        rules: policyRules,
        species: {
          multiclassing: { policy: 'forbidden', classPolicy: { mode: 'all', classIds: [] } },
        },
      }),
    )
    expect(result.errors).toEqual([expect.objectContaining({ code: 'species_policy_forbidden' })])
  })

  it('allows inherit / allowed without class restriction', () => {
    for (const policy of ['inherit', 'allowed'] as const) {
      const result = validateMulticlass(
        baseInput({
          rules: policyRules,
          species: {
            multiclassing: { policy, classPolicy: { mode: 'only', classIds: ['cleric'] } },
          },
        }),
      )
      expect(result.ok).toBe(true)
    }
  })

  it('enforces restricted + only mode', () => {
    const blocked = validateMulticlass(
      baseInput({
        rules: policyRules,
        species: {
          multiclassing: {
            policy: 'restricted',
            classPolicy: { mode: 'only', classIds: ['cleric'] },
          },
        },
      }),
    )
    expect(blocked.errors).toEqual([
      expect.objectContaining({ code: 'species_policy_class_not_allowed', classSlug: 'wizard' }),
    ])

    const allowed = validateMulticlass(
      baseInput({
        rules: policyRules,
        species: {
          multiclassing: {
            policy: 'restricted',
            classPolicy: { mode: 'only', classIds: ['wizard'] },
          },
        },
      }),
    )
    expect(allowed.ok).toBe(true)
  })

  it('enforces restricted + all_except mode', () => {
    const blocked = validateMulticlass(
      baseInput({
        rules: policyRules,
        species: {
          multiclassing: {
            policy: 'restricted',
            classPolicy: { mode: 'all_except', classIds: ['wizard'] },
          },
        },
      }),
    )
    expect(blocked.ok).toBe(false)
  })
})

describe('validateMulticlass — species level limits', () => {
  const levelRules = rules({ requirements: { speciesLevelLimits: { enabled: true } } })

  it('blocks when the resulting character level exceeds the species cap', () => {
    const result = validateMulticlass(
      baseInput({
        rules: levelRules,
        currentClasses: [{ slug: 'fighter', primaryAbilities: ['str'], level: 5 }],
        species: { levelLimits: { maxCharacterLevel: 5, classLevelCaps: [] } },
      }),
    )
    expect(result.errors).toEqual([
      expect.objectContaining({ code: 'species_level_limit_character' }),
    ])
  })

  it('blocks when the resulting class level exceeds a class cap', () => {
    const result = validateMulticlass(
      baseInput({
        rules: levelRules,
        targetClass: { slug: 'fighter', primaryAbilities: ['str'] },
        currentClasses: [{ slug: 'fighter', primaryAbilities: ['str'], level: 9 }],
        species: {
          levelLimits: {
            maxCharacterLevel: null,
            classLevelCaps: [{ classId: 'fighter', maxLevel: 9 }],
          },
        },
      }),
    )
    expect(result.errors).toEqual([
      expect.objectContaining({ code: 'species_level_limit_class', classSlug: 'fighter' }),
    ])
  })

  it('allows a brand-new class under its cap', () => {
    const result = validateMulticlass(
      baseInput({
        rules: levelRules,
        species: {
          levelLimits: {
            maxCharacterLevel: null,
            classLevelCaps: [{ classId: 'wizard', maxLevel: 2 }],
          },
        },
      }),
    )
    expect(result.ok).toBe(true)
  })
})

describe('validateMulticlass — combined requirements', () => {
  it('aggregates errors from multiple enabled requirements', () => {
    const allOn = rules({
      requirements: {
        speciesPolicy: { enabled: true },
        speciesLevelLimits: { enabled: true },
      },
    })
    const result = validateMulticlass(
      baseInput({
        rules: allOn,
        abilityScores: ABILITIES_10,
        currentClasses: [{ slug: 'fighter', primaryAbilities: ['str'], level: 5 }],
        species: {
          multiclassing: { policy: 'forbidden', classPolicy: { mode: 'all', classIds: [] } },
          levelLimits: { maxCharacterLevel: 5, classLevelCaps: [] },
        },
      }),
    )
    expect(result.ok).toBe(false)
    expect(result.errors.map((e) => e.code).sort()).toEqual([
      'primary_ability_minimum',
      'primary_ability_minimum',
      'species_level_limit_character',
      'species_policy_forbidden',
    ])
  })
})
