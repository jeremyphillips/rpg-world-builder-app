import { describe, expect, it } from 'vitest'

import {
  DEPENDENT_KIND_HERITAGE,
  formatParentChoiceTitleMeta,
  MANAGE_HERITAGE_LABEL,
} from './builder-parent-choice-status.lib'

describe('builder-parent-choice-status.lib', () => {
  it('formats unresolved parent title meta', () => {
    expect(
      formatParentChoiceTitleMeta({
        dependentKindLabel: DEPENDENT_KIND_HERITAGE,
        required: true,
      }),
    ).toBe('Heritage required')
  })

  it('formats resolved parent title meta', () => {
    expect(
      formatParentChoiceTitleMeta({
        dependentKindLabel: DEPENDENT_KIND_HERITAGE,
        required: false,
        selectedOptionLabel: 'Drow',
      }),
    ).toBe('Drow heritage')
  })

  it('exports explicit manage label constant for species heritage', () => {
    expect(MANAGE_HERITAGE_LABEL).toBe('Manage heritage')
  })
})
