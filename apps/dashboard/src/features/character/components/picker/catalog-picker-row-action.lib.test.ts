import { describe, expect, it } from 'vitest'

import { resolveCatalogPickerRowActionPhase } from './catalog-picker-row-action.lib'

describe('resolveCatalogPickerRowActionPhase', () => {
  it('follows pending → success → remove → add precedence', () => {
    expect(
      resolveCatalogPickerRowActionPhase({ isPending: true, isSuccess: true, isSelected: true }),
    ).toBe('pending')
    expect(resolveCatalogPickerRowActionPhase({ isSuccess: true, isSelected: true })).toBe(
      'success',
    )
    expect(resolveCatalogPickerRowActionPhase({ isSelected: true })).toBe('remove')
    expect(resolveCatalogPickerRowActionPhase({})).toBe('add')
  })
})
