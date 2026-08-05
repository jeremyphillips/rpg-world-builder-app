import { describe, expect, it } from 'vitest'

import { numberStepperButtonVariants, numberStepperWidthVariants } from './number-stepper.variants'

describe('numberStepperWidthVariants', () => {
  it('accounts for two 32px button columns for sm and md sizes', () => {
    expect(numberStepperWidthVariants.sm[1]).toBe('w-[calc(1*1ch+4rem)]')
    expect(numberStepperWidthVariants.sm[5]).toBe('w-[calc(5*1ch+4rem)]')
    expect(numberStepperWidthVariants.md[3]).toBe('w-[calc(3*1ch+4rem)]')
  })

  it('pairs stepper buttons with field-aligned 32px hit targets', () => {
    expect(numberStepperButtonVariants({ size: 'sm' })).toContain('size-8')
    expect(numberStepperButtonVariants({ size: 'sm' })).toContain('[&_svg]:size-icon-glyph-sm')
    expect(numberStepperButtonVariants({ size: 'md' })).toContain('[&_svg]:size-icon-glyph-md')
  })
})
