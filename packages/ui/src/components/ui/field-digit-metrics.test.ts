import { describe, expect, it } from 'vitest'

import { fieldDigitWidthVariants, resolveDigitInlineSizeClasses } from './field-digit-metrics'
import {
  fieldControlSizeClasses,
  fieldDigitSizeClasses,
  fieldDigitTrailingColumnClasses,
  fieldDigitTrailingPaddingClasses,
  fieldGroupedControlSizeClasses,
} from './field-sizing.variants'

describe('fieldDigitWidthVariants', () => {
  it('uses literal N*1ch calc classes for every size and digit slot', () => {
    expect(fieldDigitWidthVariants.md[5]).toBe('w-[calc(5*1ch+2.75rem)]')
    expect(fieldDigitWidthVariants.md[4]).toBe('w-[calc(4*1ch+2.75rem)]')
    expect(fieldDigitWidthVariants.sm[5]).toBe('w-[calc(5*1ch+2.625rem)]')
    expect(fieldDigitWidthVariants.lg[5]).toBe('w-[calc(5*1ch+3.5rem)]')
  })

  it('emits matching width and min-width from one digit formula', () => {
    const classes = resolveDigitInlineSizeClasses(3, 'md')
    expect(classes).toContain('w-[calc(3*1ch+2.75rem)]')
    expect(classes).toContain('min-w-[calc(3*1ch+2.75rem)]')
  })

  it('centralizes md control, grouped segment, and digit sizing classes', () => {
    expect(fieldControlSizeClasses.md).toBe('ui-field-control--md')
    expect(fieldGroupedControlSizeClasses.md).toContain('ui-field-group__input-segment')
    expect(fieldGroupedControlSizeClasses.md).toContain('ui-field-group--md')
    expect(fieldDigitTrailingPaddingClasses.md).toBe('pe-6')
    expect(fieldDigitSizeClasses.md).toBe('ui-field-control--digits-md')
    expect(fieldDigitTrailingColumnClasses.md).toBe('w-5')
  })
})
