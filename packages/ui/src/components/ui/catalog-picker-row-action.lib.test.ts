import { describe, expect, it } from 'vitest'

import { resolveCatalogPickerRowActionPhase } from './catalog-picker-row-action.lib'

describe('resolveCatalogPickerRowActionPhase', () => {
  it('follows pending → remove → add precedence', () => {
    expect(resolveCatalogPickerRowActionPhase({ isPending: true, isSelected: true })).toBe(
      'pending',
    )
    expect(resolveCatalogPickerRowActionPhase({ isSelected: true })).toBe('remove')
    expect(resolveCatalogPickerRowActionPhase({})).toBe('add')
  })
})
