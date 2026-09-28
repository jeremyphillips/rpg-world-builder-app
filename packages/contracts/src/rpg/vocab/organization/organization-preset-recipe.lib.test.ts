import { describe, expect, it } from 'vitest'

import {
  buildOrganizationPresetOwnedEditableSnapshot,
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

  it('detects divergence in class affinity ids', () => {
    const expected = buildOrganizationPresetOwnedEditableSnapshot('thieves_guild', ['class-rogue'])
    const current = { ...expected, classAffinityIds: ['class-fighter'] }
    expect(organizationPresetOwnedEditableMatchesRecipe(current, expected)).toBe(false)
  })
})
