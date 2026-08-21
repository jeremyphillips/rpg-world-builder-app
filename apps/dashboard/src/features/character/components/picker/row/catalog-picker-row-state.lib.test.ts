import { describe, expect, it } from 'vitest'

import {
  getCatalogPickerDisabledNote,
  isCatalogPickerRowDimmed,
} from './catalog-picker-row-state.lib'

describe('catalog picker row state', () => {
  it('dims rows that cannot be selected and are not already selected', () => {
    expect(
      isCatalogPickerRowDimmed({
        isAlreadySelected: false,
        canSelect: false,
        disabledReasons: ['Selection full'],
      }),
    ).toBe(true)
    expect(
      isCatalogPickerRowDimmed({
        isAlreadySelected: true,
        canSelect: false,
        disabledReasons: [],
      }),
    ).toBe(false)
    expect(
      isCatalogPickerRowDimmed({
        isAlreadySelected: false,
        canSelect: true,
        disabledReasons: [],
      }),
    ).toBe(false)
  })

  it('returns the first disabled reason for blocked rows', () => {
    expect(
      getCatalogPickerDisabledNote({
        isAlreadySelected: false,
        canSelect: false,
        disabledReasons: ['Selection full', 'Other'],
      }),
    ).toBe('Selection full')
    expect(
      getCatalogPickerDisabledNote({
        isAlreadySelected: false,
        canSelect: true,
        disabledReasons: ['Selection full'],
      }),
    ).toBeUndefined()
  })
})
