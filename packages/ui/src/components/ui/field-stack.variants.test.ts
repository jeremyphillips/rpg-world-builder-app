import { describe, expect, it } from 'vitest'

import {
  fieldStackDependentsChromeVariants,
  fieldSurfaceToneVariants,
} from './field-stack.variants'

describe('fieldSurfaceToneVariants', () => {
  it('applies main tone classes', () => {
    const classes = fieldSurfaceToneVariants({ tone: 'main' })
    expect(classes).toContain('border-border')
    expect(classes).toContain('bg-background')
  })

  it('applies subtle tone classes', () => {
    const classes = fieldSurfaceToneVariants({ tone: 'subtle' })
    expect(classes).toContain('border-border')
    expect(classes).toContain('bg-muted/10')
  })

  it('applies medium tone classes', () => {
    const classes = fieldSurfaceToneVariants({ tone: 'medium' })
    expect(classes).toContain('border-border')
    expect(classes).toContain('bg-muted/30')
  })

  it('applies elevated tone classes', () => {
    const classes = fieldSurfaceToneVariants({ tone: 'elevated' })
    expect(classes).toContain('border-border')
    expect(classes).toContain('bg-card')
  })

  it('applies error tone classes', () => {
    const classes = fieldSurfaceToneVariants({ tone: 'error' })
    expect(classes).toContain('border-destructive/50')
    expect(classes).toContain('bg-destructive/10')
  })
})

describe('fieldStackDependentsChromeVariants', () => {
  it('applies main tone classes', () => {
    const classes = fieldStackDependentsChromeVariants({ tone: 'main' })
    expect(classes).toContain('border-border')
    expect(classes).toContain('bg-background')
  })

  it('applies subtle tone classes by default', () => {
    const classes = fieldStackDependentsChromeVariants()
    expect(classes).toContain('border-border')
    expect(classes).toContain('bg-muted/10')
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
