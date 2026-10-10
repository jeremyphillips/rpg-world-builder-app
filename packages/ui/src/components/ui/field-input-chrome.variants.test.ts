import { describe, expect, it } from 'vitest'

import { UI_FIELD_CONTROL_BLOCK_CLASS } from './field-control.styles'
import {
  fieldGroupedDividerClasses,
  fieldGroupedShellClasses,
  fieldGroupedShellIntrinsicLayoutClasses,
  fieldInputInvalidClasses,
  fieldInputShellClasses,
} from './field-input-chrome.variants'

describe('field-input-chrome.variants', () => {
  it('exports semantic block class for single-control shell', () => {
    expect(fieldInputShellClasses).toBe(UI_FIELD_CONTROL_BLOCK_CLASS)
  })

  it('uses grouped semantic shell class for composite wrappers', () => {
    expect(fieldGroupedShellClasses).toContain('ui-field-control-shell--grouped')
    expect(fieldGroupedShellClasses).toContain('grid')
  })

  it('uses semantic invalid class for grouped shells', () => {
    expect(fieldInputInvalidClasses).toBe('ui-field-control-shell--grouped-invalid')
  })

  it('hardens intrinsic grouped shell divider track against crush', () => {
    expect(fieldGroupedShellIntrinsicLayoutClasses).toContain('minmax(1px,1px)')
    expect(fieldGroupedShellIntrinsicLayoutClasses).toContain('min-w-max')
    expect(fieldGroupedDividerClasses).toContain('min-w-px')
  })
})
