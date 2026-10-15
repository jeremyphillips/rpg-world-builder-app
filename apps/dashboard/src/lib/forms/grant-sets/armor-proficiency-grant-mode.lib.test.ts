import { describe, expect, it } from 'vitest'

import {
  armorProficiencyGrantSetFromMode,
  armorProficiencyModeFromGrantSet,
  isMixedArmorProficiencyGrantSet,
} from './armor-proficiency-grant-mode.lib'

describe('armorProficiencyGrantSetFromMode', () => {
  it('projects active branch only', () => {
    const buckets = { categories: ['heavy'], items: ['plate'] }
    expect(armorProficiencyGrantSetFromMode('categories', buckets)).toEqual({
      categories: ['heavy'],
      items: [],
    })
  })
})

describe('armorProficiencyModeFromGrantSet', () => {
  it('returns none for empty grant', () => {
    expect(armorProficiencyModeFromGrantSet({ categories: [], items: [] })).toEqual({
      kind: 'resolved',
      mode: 'none',
    })
  })

  it('returns mixed for dual-branch persisted grants', () => {
    expect(armorProficiencyModeFromGrantSet({ categories: ['light'], items: ['shield'] })).toEqual({
      kind: 'mixed',
    })
  })
})

describe('isMixedArmorProficiencyGrantSet', () => {
  it('detects mixed persisted armor grants', () => {
    expect(isMixedArmorProficiencyGrantSet({ categories: ['light'], items: ['shield'] })).toBe(true)
  })
})
