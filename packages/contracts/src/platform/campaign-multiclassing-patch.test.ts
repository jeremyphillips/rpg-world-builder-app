import { describe, expect, it } from 'vitest'

import {
  campaignMulticlassingPatchSchema,
  DEFAULT_PRIMARY_ABILITY_MINIMUM,
  isSparseDefaultMulticlassingPatch,
  resolveMulticlassingRules,
} from './campaign-multiclassing-patch'

describe('resolveMulticlassingRules', () => {
  it('applies SRD defaults when no patch is stored', () => {
    expect(resolveMulticlassingRules(undefined)).toEqual({
      enabled: true,
      requirements: {
        primaryAbilityMinimum: { enabled: true, minimumScore: DEFAULT_PRIMARY_ABILITY_MINIMUM },
        speciesPolicy: { enabled: false },
        speciesLevelLimits: { enabled: false },
      },
    })
  })

  it('merges partial overrides onto defaults', () => {
    const resolved = resolveMulticlassingRules({
      requirements: {
        primaryAbilityMinimum: { minimumScore: 15 },
        speciesPolicy: { enabled: true },
      },
    })

    expect(resolved.requirements.primaryAbilityMinimum).toEqual({ enabled: true, minimumScore: 15 })
    expect(resolved.requirements.speciesPolicy.enabled).toBe(true)
    expect(resolved.requirements.speciesLevelLimits.enabled).toBe(false)
  })

  it('honors full overrides including a disabled feature', () => {
    const resolved = resolveMulticlassingRules({
      enabled: false,
      requirements: {
        primaryAbilityMinimum: { enabled: false, minimumScore: 10 },
        speciesPolicy: { enabled: true },
        speciesLevelLimits: { enabled: true },
      },
    })

    expect(resolved).toEqual({
      enabled: false,
      requirements: {
        primaryAbilityMinimum: { enabled: false, minimumScore: 10 },
        speciesPolicy: { enabled: true },
        speciesLevelLimits: { enabled: true },
      },
    })
  })
})

describe('isSparseDefaultMulticlassingPatch', () => {
  it('is true for undefined and for patches that resolve to defaults', () => {
    expect(isSparseDefaultMulticlassingPatch(undefined)).toBe(true)
    expect(
      isSparseDefaultMulticlassingPatch({
        enabled: true,
        requirements: {
          primaryAbilityMinimum: { enabled: true, minimumScore: DEFAULT_PRIMARY_ABILITY_MINIMUM },
        },
      }),
    ).toBe(true)
  })

  it('is false when any value diverges from the default', () => {
    expect(isSparseDefaultMulticlassingPatch({ enabled: false })).toBe(false)
    expect(
      isSparseDefaultMulticlassingPatch({
        requirements: { primaryAbilityMinimum: { minimumScore: 14 } },
      }),
    ).toBe(false)
    expect(
      isSparseDefaultMulticlassingPatch({ requirements: { speciesPolicy: { enabled: true } } }),
    ).toBe(false)
  })
})

describe('campaignMulticlassingPatchSchema', () => {
  it('rejects unknown keys (strict)', () => {
    expect(campaignMulticlassingPatchSchema.safeParse({ foo: true }).success).toBe(false)
  })

  it('rejects a minimum score above the character ability cap', () => {
    const result = campaignMulticlassingPatchSchema.safeParse({
      requirements: { primaryAbilityMinimum: { minimumScore: 21 } },
    })

    expect(result.success).toBe(false)
  })
})
