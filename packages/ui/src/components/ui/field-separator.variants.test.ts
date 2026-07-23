import { describe, expect, it } from 'vitest'

import { fieldSeparatorVariants } from './field.variants'

describe('fieldSeparatorVariants', () => {
  it('maps subtle tone to the quiet border ladder token', () => {
    expect(fieldSeparatorVariants({ tone: 'subtle', rhythm: 'comfortable' })).toContain('border-b')
    expect(fieldSeparatorVariants({ tone: 'subtle', rhythm: 'comfortable' })).toContain(
      'border-border-subtle',
    )
    expect(fieldSeparatorVariants({ tone: 'subtle', rhythm: 'comfortable' })).toContain('pb-7')
  })

  it('maps default tone to the standard border token', () => {
    expect(fieldSeparatorVariants({ tone: 'default', rhythm: 'comfortable' })).toContain(
      'border-border',
    )
    expect(fieldSeparatorVariants({ tone: 'default', rhythm: 'comfortable' })).not.toContain(
      'border-border-subtle',
    )
  })

  it('maps strong tone to the emphasized border token', () => {
    expect(fieldSeparatorVariants({ tone: 'strong', rhythm: 'comfortable' })).toContain(
      'border-border-strong',
    )
  })

  it('uses compact trailing padding for compact rhythm', () => {
    expect(fieldSeparatorVariants({ tone: 'subtle', rhythm: 'compact' })).toContain('pb-2')
    expect(fieldSeparatorVariants({ tone: 'subtle', rhythm: 'compact' })).not.toContain('pb-7')
  })
})
