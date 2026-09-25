import { describe, expect, it } from 'vitest'

import {
  optionCardBodyVariants,
  optionCardCompactBodyInsetClasses,
  optionCardDescriptionVariants,
  optionCardEmbeddedSlotVariants,
  optionCardSelectedChromeClasses,
  optionCardTitleVariants,
  selectionOptionCardShellVariants,
} from './selection-option-card.variants'
import {
  radioCardShellSelectedChromeClasses,
  radioCardShellVariants,
  radioCardVariants,
} from './radio-card.variants'

describe('optionCard selected chrome parity', () => {
  it('uses the same selected classes on static and radio shells', () => {
    expect(selectionOptionCardShellVariants({ selected: true })).toContain(
      optionCardSelectedChromeClasses,
    )
    expect(radioCardShellVariants({ selected: true })).toContain(
      radioCardShellSelectedChromeClasses,
    )
  })

  it('applies selected chrome to checked radio card variant', () => {
    expect(radioCardVariants({ variant: 'card' })).toContain('data-[state=checked]:border-primary')
    expect(radioCardVariants({ variant: 'card' })).toContain(
      'data-[state=checked]:bg-surface-strong',
    )
    expect(radioCardVariants({ variant: 'card' })).toContain('data-[state=checked]:ring-1')
    expect(radioCardVariants({ variant: 'card' })).toContain('data-[state=checked]:ring-primary/20')
  })
})

describe('optionCard surface establishment', () => {
  it('establishes the surface-subtle plane on radio card variant and outer shell', () => {
    expect(radioCardVariants({ variant: 'card' })).toContain(
      '[--surface-current:var(--surface-subtle)]',
    )
    expect(radioCardShellVariants()).toContain('[--surface-current:var(--surface-subtle)]')
  })

  it('establishes background independently on embedded slots', () => {
    const panel = optionCardEmbeddedSlotVariants({ tone: 'panel' })
    const divider = optionCardEmbeddedSlotVariants({ tone: 'divider' })
    expect(panel).toContain('[--surface-current:var(--background)]')
    expect(panel).toContain('bg-background')
    expect(divider).toContain('[--surface-current:var(--background)]')
    expect(divider).toContain('bg-background')
  })

  it('uses compact option padding with control and density-owned typography', () => {
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).toContain('py-2')
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).toContain('pl-3')
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).toContain('pr-4')
    expect(optionCardTitleVariants({ density: 'compact' })).toContain('text-sm')
    expect(optionCardDescriptionVariants({ density: 'compact' })).toContain('text-xs')
  })

  it('aligns compact embedded panel inset with 12px option shell padding', () => {
    expect(optionCardCompactBodyInsetClasses).toBe('pl-[calc(0.75rem+1rem+0.75rem)]')
    expect(optionCardEmbeddedSlotVariants({ tone: 'panel', density: 'compact' })).toContain('-ml-3')
    expect(optionCardEmbeddedSlotVariants({ tone: 'panel', density: 'compact' })).toContain('-mr-4')
  })

  it('removes compact title/description gap via shared body stack token', () => {
    expect(optionCardBodyVariants({ density: 'compact' })).toContain('gap-0')
  })
})
