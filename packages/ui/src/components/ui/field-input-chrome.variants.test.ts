import { describe, expect, it } from 'vitest'

import { UI_FIELD_CONTROL_BLOCK_CLASS } from './field-control.styles'
import { UI_FIELD_GROUP_BLOCK_CLASS, UI_FIELD_GROUP_INVALID_CLASS } from './field-group.styles'
import {
  fieldGroupedShellClasses,
  fieldGroupedShellIntrinsicLayoutClasses,
  fieldInputInvalidClasses,
  groupedDividerVariants,
} from './field-input-chrome.variants'

describe('field-input-chrome.variants', () => {
  it('uses semantic block class for single-control shell', () => {
    expect(UI_FIELD_CONTROL_BLOCK_CLASS).toContain('ui-field-control')
  })

  it('uses grouped semantic shell class for composite wrappers', () => {
    expect(fieldGroupedShellClasses).toContain(UI_FIELD_GROUP_BLOCK_CLASS)
    expect(fieldGroupedShellClasses).toContain('grid')
  })

  it('uses semantic invalid class for grouped shells', () => {
    expect(fieldInputInvalidClasses).toBe(UI_FIELD_GROUP_INVALID_CLASS)
  })

  it('hardens intrinsic grouped shell divider track against crush', () => {
    expect(fieldGroupedShellIntrinsicLayoutClasses).toContain('ui-field-group--intrinsic')
    expect(groupedDividerVariants({ strength: 'primary' })).toContain('ui-field-group__divider')
  })
})
