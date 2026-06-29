import { describe, expect, it } from 'vitest'

import { fieldStackDependentsChromeVariants } from './field-stack.variants'

describe('fieldStackDependentsChromeVariants', () => {
  it('applies subtle tone classes by default', () => {
    const classes = fieldStackDependentsChromeVariants()
    expect(classes).toContain('border-border')
    expect(classes).toContain('bg-muted/30')
  })

  it('applies error tone classes', () => {
    const classes = fieldStackDependentsChromeVariants({ tone: 'error' })
    expect(classes).toContain('border-destructive/50')
    expect(classes).toContain('bg-destructive/10')
  })

  it('applies warning tone stub classes', () => {
    const classes = fieldStackDependentsChromeVariants({ tone: 'warning' })
    expect(classes).toContain('bg-accent/30')
  })
})
