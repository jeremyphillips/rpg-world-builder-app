import { describe, expect, it } from 'vitest'

import {
  applyResolutionStructuralCleanup,
  buildIncompatibleSelectionClearPatch,
  getEffectKindAvailability,
  getMethodAvailability,
  planResolutionChange,
  resolutionChangeRequiresConfirm,
} from './selection-policy'
import type { ResolutionSelectionState } from './selection-types'

function distanceRangedState(
  overrides: Partial<ResolutionSelectionState> = {},
): ResolutionSelectionState {
  return {
    proximityKind: 'distance',
    proximityDistanceFt: 120,
    targetKind: 'creature-or-object',
    targetCount: 1,
    methodKind: 'attack',
    attackType: 'ranged-spell',
    applicationPatternKind: 'projectiles',
    projectileCount: 3,
    projectileUnitLabelSingular: 'dart',
    projectileUnitLabelPlural: 'darts',
    effects: [{ id: 'damage', kind: 'damage' }],
    ...overrides,
  }
}

describe('getMethodAvailability', () => {
  it('disallows ranged spell attack for self proximity', () => {
    const availability = getMethodAvailability(
      { proximityKind: 'self', targetKind: 'creature', targetCount: 1 },
      'ranged-spell',
    )
    expect(availability.allowed).toBe(false)
    expect(availability.reason?.code).toBe('method-incompatible-with-proximity')
  })

  it('allows automatic for self proximity', () => {
    expect(
      getMethodAvailability(
        { proximityKind: 'self', targetKind: 'creature', targetCount: 1 },
        'automatic',
      ).allowed,
    ).toBe(true)
  })
})

describe('getEffectKindAvailability', () => {
  it('disallows healing for ranged spell attack resolution', () => {
    const availability = getEffectKindAvailability(distanceRangedState(), 'healing')
    expect(availability.allowed).toBe(false)
    expect(availability.reason?.code).toBe('effect-kind-unsupported-for-method')
  })
})

describe('planResolutionChange', () => {
  it('distance→self reports incompatible method and pattern without auto-setting automatic', () => {
    const before = distanceRangedState()
    const plan = planResolutionChange(before, { field: 'proximityKind', value: 'self' })

    expect(plan.requestedPatch).toEqual({ proximityKind: 'self' })
    expect(plan.incompatibleSelections).toEqual([
      { field: 'method', currentOption: 'ranged-spell' },
      { field: 'applicationPattern', currentKind: 'projectiles' },
    ])
    expect(plan.effectsToRemove).toEqual([])
    expect(resolutionChangeRequiresConfirm(plan)).toBe(true)

    const cleared = buildIncompatibleSelectionClearPatch(plan.incompatibleSelections)
    expect(cleared.methodKind).toBeUndefined()
    expect(cleared.attackType).toBeUndefined()
    expect(cleared.applicationPatternKind).toBe('none')
    expect(cleared.methodKind).not.toBe('automatic')
  })

  it('saving-throw→attack clears saveAbility without confirm', () => {
    const before: ResolutionSelectionState = {
      proximityKind: 'touch',
      targetKind: 'creature',
      targetCount: 1,
      methodKind: 'saving-throw',
      saveAbility: 'con',
      applicationPatternKind: 'none',
      effects: [{ id: 'damage', kind: 'damage' }],
    }

    const plan = planResolutionChange(before, { field: 'methodOption', value: 'melee-spell' })

    expect(plan.cleanupPatch.saveAbility).toBeUndefined()
    expect(plan.incompatibleSelections).toEqual([])
    expect(plan.effectsToRemove).toEqual([])
    expect(resolutionChangeRequiresConfirm(plan)).toBe(false)
  })

  it('requires confirm when effects would be removed', () => {
    const before: ResolutionSelectionState = {
      proximityKind: 'distance',
      proximityDistanceFt: 120,
      targetKind: 'creature',
      targetCount: 1,
      methodKind: 'automatic',
      applicationPatternKind: 'none',
      effects: [
        { id: 'damage', kind: 'damage' },
        { id: 'healing', kind: 'healing' },
      ],
    }

    const plan = planResolutionChange(before, {
      field: 'methodOption',
      value: 'ranged-spell',
    })

    expect(plan.effectsToRemove).toEqual([{ id: 'healing', kind: 'healing' }])
    expect(resolutionChangeRequiresConfirm(plan)).toBe(true)
  })

  it('collects advisory warnings for self damage and duplicate healing', () => {
    const plan = planResolutionChange(
      {
        proximityKind: 'self',
        targetKind: 'creature',
        targetCount: 1,
        methodKind: 'automatic',
        applicationPatternKind: 'none',
        effects: [
          { id: 'damage', kind: 'damage' },
          { id: 'heal-1', kind: 'healing' },
          { id: 'heal-2', kind: 'healing' },
        ],
      },
      { field: 'proximityKind', value: 'self' },
    )

    expect(plan.warnings).toEqual([
      { code: 'self-with-damage' },
      { code: 'multiple-healing-effects' },
    ])
  })

  it('warns when check-based resolution has no damage effect', () => {
    const plan = planResolutionChange(
      {
        proximityKind: 'touch',
        targetKind: 'creature',
        targetCount: 1,
        methodKind: 'saving-throw',
        saveAbility: 'con',
        applicationPatternKind: 'none',
        effects: [{ id: 'healing', kind: 'healing' }],
      },
      { field: 'methodOption', value: 'saving-throw' },
    )

    expect(plan.warnings).toContainEqual({ code: 'check-without-damage-effect' })
  })

  it('warns when automatic distance resolution has no projectile pattern', () => {
    const plan = planResolutionChange(
      {
        proximityKind: 'distance',
        proximityDistanceFt: 60,
        targetKind: 'creature',
        targetCount: 1,
        methodKind: 'automatic',
        applicationPatternKind: 'none',
        effects: [{ id: 'damage', kind: 'damage' }],
      },
      { field: 'methodOption', value: 'automatic' },
    )

    expect(plan.warnings).toContainEqual({ code: 'automatic-distance-without-pattern' })
  })
})

describe('applyResolutionStructuralCleanup', () => {
  it('clears hidden dependent fields without removing method or effects', () => {
    const state: ResolutionSelectionState = {
      proximityKind: 'touch',
      proximityDistanceFt: 60,
      targetKind: 'creature',
      targetCount: 1,
      methodKind: 'attack',
      attackType: 'melee-spell',
      applicationPatternKind: 'none',
      saveAbility: 'wis',
      effects: [{ id: 'damage', kind: 'damage' }],
    }

    const patch = applyResolutionStructuralCleanup(state)

    expect(patch.proximityDistanceFt).toBeUndefined()
    expect(patch.saveAbility).toBeUndefined()
    expect(patch.methodKind).toBeUndefined()
    expect(patch.effects).toBeUndefined()
  })
})
