import { describe, expect, it } from 'vitest'

import { fieldHintTypographyVariants } from './field.variants'

describe('fieldHintTypographyVariants', () => {
  it('maps xs and sm to compact field-hint utilities', () => {
    expect(fieldHintTypographyVariants({ size: 'xs' })).toBe('text-style-field-hint-compact')
    expect(fieldHintTypographyVariants({ size: 'sm' })).toBe('text-style-field-hint-compact')
  })

  it('maps md and lg to standard field-hint utilities', () => {
    expect(fieldHintTypographyVariants({ size: 'md' })).toBe('text-style-field-hint')
    expect(fieldHintTypographyVariants({ size: 'lg' })).toBe('text-style-field-hint')
  })

  it('defaults to md', () => {
    expect(fieldHintTypographyVariants()).toBe('text-style-field-hint')
  })
})
