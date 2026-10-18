import { describe, expect, it } from 'vitest'

import { cardSurfaceClasses, cardSurfaceVariants } from './card.variants'

describe('cardSurfaceVariants', () => {
  it('emits the card block for the default surface', () => {
    expect(cardSurfaceClasses).toContain('ui-card')
    expect(cardSurfaceClasses).toContain('ui-card--static')
    expect(cardSurfaceClasses).not.toContain('ui-card--interactive')
  })

  it('emits an interactive modifier for navigation cards', () => {
    expect(cardSurfaceVariants({ interactive: true })).toContain('ui-card--interactive')
    expect(cardSurfaceVariants({ interactive: true })).not.toContain('ui-card--static')
  })

  it('does not emit selected without a tone', () => {
    expect(cardSurfaceVariants({ selected: true })).not.toContain('ui-card--selected')
    expect(cardSurfaceVariants({ tone: 'quiet', selected: true })).toContain('ui-card--selected')
  })
})
