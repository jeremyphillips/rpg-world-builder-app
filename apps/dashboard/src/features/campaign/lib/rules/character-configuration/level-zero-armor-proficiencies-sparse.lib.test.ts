import { describe, expect, it } from 'vitest'

import type { ArmorProficiencyGrantSet } from '@rpg/contracts'

import { resolveLevelZeroArmorProficienciesSparsePatch } from './level-zero-armor-proficiencies-sparse.lib'

const EMPTY: ArmorProficiencyGrantSet = { categories: [], items: [] }
const LIGHT: ArmorProficiencyGrantSet = { categories: ['light'], items: [] }
const HEAVY: ArmorProficiencyGrantSet = { categories: ['heavy'], items: [] }

describe('resolveLevelZeroArmorProficienciesSparsePatch', () => {
  it('returns explicit empty when baseline is non-empty and override is absent (None)', () => {
    expect(
      resolveLevelZeroArmorProficienciesSparsePatch({
        mode: 'none',
        projected: EMPTY,
        storedOverride: undefined,
        baseline: LIGHT,
      }),
    ).toEqual(EMPTY)
  })

  it('returns explicit empty when clearing a stored non-empty override (None)', () => {
    expect(
      resolveLevelZeroArmorProficienciesSparsePatch({
        mode: 'none',
        projected: EMPTY,
        storedOverride: HEAVY,
        baseline: LIGHT,
      }),
    ).toEqual(EMPTY)
  })

  it('omits when stored override is already explicit empty (None)', () => {
    expect(
      resolveLevelZeroArmorProficienciesSparsePatch({
        mode: 'none',
        projected: EMPTY,
        storedOverride: EMPTY,
        baseline: LIGHT,
      }),
    ).toBeUndefined()
  })

  it('omits when baseline is empty and override is absent (None)', () => {
    expect(
      resolveLevelZeroArmorProficienciesSparsePatch({
        mode: 'none',
        projected: EMPTY,
        storedOverride: undefined,
        baseline: EMPTY,
      }),
    ).toBeUndefined()
  })

  it('updates when author selects categories', () => {
    expect(
      resolveLevelZeroArmorProficienciesSparsePatch({
        mode: 'categories',
        projected: LIGHT,
        storedOverride: HEAVY,
        baseline: EMPTY,
      }),
    ).toEqual(LIGHT)
  })

  it('distinguishes omit from explicit empty when both resolve to no armor under empty default', () => {
    const withBaseline = resolveLevelZeroArmorProficienciesSparsePatch({
      mode: 'none',
      projected: EMPTY,
      storedOverride: undefined,
      baseline: LIGHT,
    })
    const withoutBaseline = resolveLevelZeroArmorProficienciesSparsePatch({
      mode: 'none',
      projected: EMPTY,
      storedOverride: undefined,
      baseline: EMPTY,
    })

    expect(withBaseline).toEqual(EMPTY)
    expect(withoutBaseline).toBeUndefined()
  })
})
