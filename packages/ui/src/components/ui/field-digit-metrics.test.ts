import { describe, expect, it } from 'vitest'

import { fieldDigitWidthVariants } from './field-digit-metrics'
import {
  fieldControlSizeClasses,
  fieldDigitSizeClasses,
  fieldDigitTrailingColumnClasses,
  fieldDigitTrailingIconClasses,
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

  it('centralizes md control, grouped segment, and digit sizing classes', () => {
    expect(fieldControlSizeClasses.md).toBe('h-9 px-3 py-1.5 text-md')
    expect(fieldGroupedControlSizeClasses.md).toBe('h-9 pl-3 py-1.5 text-md')
    expect(fieldDigitTrailingPaddingClasses.md).toBe('pr-6')
    expect(fieldDigitSizeClasses.md).toBe('pl-3 pr-6')
    expect(fieldDigitTrailingColumnClasses.md).toBe('w-5')
    expect(fieldDigitTrailingIconClasses.md).toBe('[&_svg]:size-2.5')
  })
})
