import { describe, expect, it } from 'vitest'

import { fieldDigitWidthVariants } from './field-digit-metrics'

describe('fieldDigitWidthVariants', () => {
  it('uses literal N*1ch calc classes for every size and digit slot', () => {
    expect(fieldDigitWidthVariants.md[5]).toBe('w-[calc(5*1ch+3.125rem)]')
    expect(fieldDigitWidthVariants.md[4]).toBe('w-[calc(4*1ch+3.125rem)]')
    expect(fieldDigitWidthVariants.sm[5]).toBe('w-[calc(5*1ch+2.625rem)]')
    expect(fieldDigitWidthVariants.lg[5]).toBe('w-[calc(5*1ch+3.5rem)]')
  })
})
