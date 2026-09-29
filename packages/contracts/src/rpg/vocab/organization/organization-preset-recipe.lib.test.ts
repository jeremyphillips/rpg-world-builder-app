import { describe, expect, it } from 'vitest'

import {
  buildOrganizationPresetOwnedEditableSnapshot,
  listOrganizationPresetOwnedEditableDivergentFieldKeys,
  organizationPresetOwnedEditableMatchesRecipe,
} from './organization-preset-recipe.lib'

describe('organization preset owned editable recipe', () => {
  it('matches when arrays differ only by order', () => {
    const expected = buildOrganizationPresetOwnedEditableSnapshot('army', ['class-a', 'class-b'])
    const current = {
      ...expected,
      functions: [...expected.functions].reverse(),
      practices: [...expected.practices].reverse(),
      classAffinityIds: ['class-b', 'class-a'],
    }
    expect(organizationPresetOwnedEditableMatchesRecipe(current, expected)).toBe(true)
  })

  it('lists divergent preset-owned field keys in stable order', () => {
    const expected = buildOrganizationPresetOwnedEditableSnapshot('bank', ['class-a'])
    const current = {
      ...expected,
      organizationDomain: 'government' as typeof expected.organizationDomain,
      practices: ['brewing' as const],
    }
    expect(listOrganizationPresetOwnedEditableDivergentFieldKeys(current, expected)).toEqual([
      'organizationDomain',
      'practices',
    ])
  })

  it('detects divergence in class affinity ids', () => {
    const expected = buildOrganizationPresetOwnedEditableSnapshot('thieves_guild', ['class-rogue'])
    const current = { ...expected, classAffinityIds: ['class-fighter'] }
    expect(organizationPresetOwnedEditableMatchesRecipe(current, expected)).toBe(false)
  })
})
