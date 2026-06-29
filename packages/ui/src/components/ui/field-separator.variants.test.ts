import { describe, expect, it } from 'vitest'

import { fieldSeparatorVariants } from './field.variants'

describe('fieldSeparatorVariants', () => {
  it('applies a subtle trailing border divider', () => {
    expect(fieldSeparatorVariants({ tone: 'subtle' })).toContain('border-b')
    expect(fieldSeparatorVariants({ tone: 'subtle' })).toContain('border-border')
    expect(fieldSeparatorVariants({ tone: 'subtle' })).toContain('pb-4')
  })
})
