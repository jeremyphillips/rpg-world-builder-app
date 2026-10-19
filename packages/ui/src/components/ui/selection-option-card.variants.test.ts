import { describe, expect, it } from 'vitest'

import { cardSurfaceVariants } from './card.variants'
import {
  optionCardBodyVariants,
  optionCardCompactBodyInsetClasses,
  optionCardEmbeddedContentInsetClasses,
  optionCardCompactSecondaryTypographyClasses,
  optionCardSecondaryCopyStackVariants,
  optionCardSummaryBadgeRowVariants,
  optionCardDescriptionVariants,
  optionCardEmbeddedSlotVariants,
  optionCardSummaryTitleVariants,
  optionCardTitleVariants,
} from './selection-option-card.variants'
import { radioCardVariants } from './radio-card.variants'

describe('optionCard selected chrome parity', () => {
  it('uses ui-card strong selected surface on static selection cards', () => {
    expect(cardSurfaceVariants({ tone: 'strong', selected: true })).toContain('ui-card--selected')
    expect(cardSurfaceVariants({ tone: 'strong', selected: true })).toContain('ui-card--strong')
  })
})

describe('optionCard surface establishment', () => {
  it('does not paint a separate fill on embedded slots', () => {
    for (const tone of ['panel', 'divider', 'plain'] as const) {
      const classes = optionCardEmbeddedSlotVariants({ tone })
      expect(classes).not.toContain('bg-background')
      expect(classes).not.toContain('bg-surface-muted')
      expect(classes).toContain('border-t')
    }
  })

  it('uses compact option padding with control and density-owned typography', () => {
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).not.toContain('pl-3')
    expect(radioCardVariants({ variant: 'card', density: 'compact' })).not.toContain('px-4')
    expect(optionCardTitleVariants({ density: 'compact' })).toContain('text-sm')
    expect(optionCardSummaryTitleVariants({ density: 'compact' })).toContain('text-sm')
    expect(optionCardSummaryTitleVariants({ density: 'comfortable' })).toContain('text-base')
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
    expect(optionCardEmbeddedContentInsetClasses.comfortable).toBe('pl-[calc(1.25rem+1rem)]')
    expect(optionCardEmbeddedContentInsetClasses.compact).toBe('pl-[calc(1rem+0.75rem)]')
    expect(optionCardEmbeddedSlotVariants({ tone: 'plain', density: 'comfortable' })).toContain(
      optionCardEmbeddedContentInsetClasses.comfortable,
    )
    expect(optionCardEmbeddedSlotVariants({ tone: 'divider', density: 'compact' })).toContain(
      optionCardEmbeddedContentInsetClasses.compact,
    )
    expect(optionCardEmbeddedSlotVariants({ tone: 'panel', density: 'comfortable' })).not.toContain(
      optionCardEmbeddedContentInsetClasses.comfortable,
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
