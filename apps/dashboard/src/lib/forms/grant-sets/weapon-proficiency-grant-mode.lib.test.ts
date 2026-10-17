import { describe, expect, it } from 'vitest'

import {
  isMixedWeaponProficiencyGrantSet,
  isTransientDualBranchFormState,
  weaponProficiencyGrantSetFromMode,
  weaponProficiencyModeFromGrantSet,
} from './weapon-proficiency-grant-mode.lib'

describe('weaponProficiencyGrantSetFromMode', () => {
  const buckets = { categories: ['martial'], items: ['club'] }

  it('projects none to empty grant', () => {
    expect(weaponProficiencyGrantSetFromMode('none', buckets)).toEqual({
      categories: [],
      items: [],
    })
  })

  it('projects categories and drops items', () => {
    expect(weaponProficiencyGrantSetFromMode('categories', buckets)).toEqual({
      categories: ['martial'],
      items: [],
    })
  })

  it('projects specific and drops categories', () => {
    expect(weaponProficiencyGrantSetFromMode('specific', buckets)).toEqual({
      categories: [],
      items: ['club'],
    })
  })

  it('does not mutate form bucket input', () => {
    const formBuckets = { categories: ['simple'], items: ['dagger'] }
    weaponProficiencyGrantSetFromMode('categories', formBuckets)
    expect(formBuckets).toEqual({ categories: ['simple'], items: ['dagger'] })
  })
})

describe('weaponProficiencyModeFromGrantSet', () => {
  it('returns none for empty grant', () => {
    expect(weaponProficiencyModeFromGrantSet({ categories: [], items: [] })).toEqual({
      kind: 'resolved',
      mode: 'none',
    })
  })

  it('returns specific when items are present', () => {
    expect(weaponProficiencyModeFromGrantSet({ categories: [], items: ['srd:club'] })).toEqual({
      kind: 'resolved',
      mode: 'specific',
    })
  })

  it('returns categories when only categories are present', () => {
    expect(weaponProficiencyModeFromGrantSet({ categories: ['martial'], items: [] })).toEqual({
      kind: 'resolved',
      mode: 'categories',
    })
  })

  it('returns mixed for persisted dual-branch grants', () => {
    expect(weaponProficiencyModeFromGrantSet({ categories: ['martial'], items: ['club'] })).toEqual(
      { kind: 'mixed' },
    )
  })
})

describe('isMixedWeaponProficiencyGrantSet', () => {
  it('is false for single-branch and empty grants', () => {
    expect(isMixedWeaponProficiencyGrantSet({ categories: ['simple'], items: [] })).toBe(false)
    expect(isMixedWeaponProficiencyGrantSet({ categories: [], items: ['club'] })).toBe(false)
    expect(isMixedWeaponProficiencyGrantSet({ categories: [], items: [] })).toBe(false)
  })
})

describe('isTransientDualBranchFormState', () => {
  it('allows dual branches while a non-none mode is active', () => {
    expect(
      isTransientDualBranchFormState('specific', { categories: ['martial'], items: ['club'] }),
    ).toBe(true)
  })

  it('is false when mode is none', () => {
    expect(
      isTransientDualBranchFormState('none', { categories: ['martial'], items: ['club'] }),
    ).toBe(false)
  })
})
