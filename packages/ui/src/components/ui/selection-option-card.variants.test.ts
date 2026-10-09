import { describe, expect, it } from 'vitest'

import {
  optionCardBodyVariants,
  optionCardCompactBodyInsetClasses,
  optionCardEmbeddedContentInsetClasses,
  optionCardCompactSecondaryTypographyClasses,
  optionCardSecondaryCopyStackVariants,
  optionCardSummaryBadgeRowVariants,
  optionCardDescriptionVariants,
  optionCardEmbeddedSlotVariants,
  optionCardSelectedChromeClasses,
  optionCardSummaryTitleVariants,
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
  it('establishes the muted plane on radio cards and keeps hover on surface-subtle', () => {
    expect(radioCardVariants({ variant: 'card' })).toContain('bg-surface-muted')
    expect(radioCardVariants({ variant: 'card' })).toContain(
      '[--surface-current:var(--surface-muted)]',
    )
    expect(radioCardVariants({ variant: 'card' })).toContain(
      '[--surface-current:var(--surface-subtle)]',
    )
    expect(radioCardShellVariants()).toContain('bg-surface-muted')
    expect(radioCardShellVariants()).toContain('[--surface-current:var(--surface-muted)]')
    expect(radioCardShellVariants()).toContain('[--surface-current:var(--surface-subtle)]')
    expect(radioCardShellVariants({ selected: true })).toContain('bg-surface-strong')
  })

  it('does not paint a separate fill on embedded slots', () => {
    for (const tone of ['panel', 'divider', 'plain'] as const) {
      const classes = optionCardEmbeddedSlotVariants({ tone })
      expect(classes).not.toContain('bg-background')
      expect(classes).not.toContain('bg-surface-muted')
      expect(classes).toContain('border-t')
    }
  })

  it('uses compact option padding with control and density-owned typography', () => {
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).toContain('py-2')
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).toContain('pl-3')
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).toContain('pr-4')
    expect(optionCardTitleVariants({ density: 'compact' })).toContain('text-sm')
    expect(optionCardSummaryTitleVariants({ density: 'compact' })).toContain('text-sm')
    expect(optionCardSummaryTitleVariants({ density: 'default' })).toContain('text-base')
    expect(optionCardDescriptionVariants({ density: 'compact' })).toContain('text-xs')
    expect(optionCardDescriptionVariants({ density: 'compact' })).toContain('leading-snug')
  })

  it('breaks compact embedded panel out to the card horizontal edges', () => {
    expect(optionCardCompactBodyInsetClasses).toBe('pl-[calc(0.75rem+1rem+0.75rem)]')
    expect(optionCardEmbeddedSlotVariants({ tone: 'panel', density: 'compact' })).toContain('-mx-4')
    expect(optionCardEmbeddedSlotVariants({ tone: 'panel', density: 'compact' })).toContain(
      'rounded-b-card',
    )
    expect(optionCardEmbeddedSlotVariants({ tone: 'panel', density: 'compact' })).not.toContain(
      optionCardEmbeddedContentInsetClasses.compact,
    )
  })

  it('insets in-flow embedded slots to the title column', () => {
    expect(optionCardEmbeddedContentInsetClasses.default).toBe('pl-[calc(1.25rem+1rem)]')
    expect(optionCardEmbeddedContentInsetClasses.compact).toBe('pl-[calc(1rem+0.75rem)]')
    expect(optionCardEmbeddedSlotVariants({ tone: 'plain', density: 'default' })).toContain(
      optionCardEmbeddedContentInsetClasses.default,
    )
    expect(optionCardEmbeddedSlotVariants({ tone: 'divider', density: 'compact' })).toContain(
      optionCardEmbeddedContentInsetClasses.compact,
    )
    expect(optionCardEmbeddedSlotVariants({ tone: 'panel', density: 'default' })).not.toContain(
      optionCardEmbeddedContentInsetClasses.default,
    )
  })

  it('removes compact title/description gap via shared body stack token', () => {
    expect(optionCardBodyVariants({ density: 'compact' })).toContain('gap-0')
  })

  it('shrink-wraps secondary copy when copyWidth is content', () => {
    expect(optionCardSecondaryCopyStackVariants({ copyWidth: 'content' })).toContain('w-fit')
  })

  it('applies compact metadata typography on the secondary copy stack', () => {
    expect(optionCardSecondaryCopyStackVariants({ density: 'compact' })).toContain(
      optionCardCompactSecondaryTypographyClasses,
    )
  })

  it('reserves badge sm height for optional summary badge rows', () => {
    expect(optionCardSummaryBadgeRowVariants()).toContain('min-h-[22px]')
  })

  it('keeps the content column flexible in the card body stack', () => {
    expect(optionCardBodyVariants()).toContain('flex-1')
    expect(optionCardBodyVariants()).toContain('min-w-0')
  })
})
