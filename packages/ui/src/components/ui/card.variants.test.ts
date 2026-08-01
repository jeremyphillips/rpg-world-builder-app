import { describe, expect, it } from 'vitest'

import { cardSurfaceClasses } from './card.variants'
import { fieldSurfaceRaisedShadowClasses } from './field-surface.variants'

describe('cardSurfaceClasses', () => {
  it('includes card fill, warm border, and raised surface shadow', () => {
    expect(cardSurfaceClasses).toContain('bg-card')
    expect(cardSurfaceClasses).toContain('border-card-border')
    expect(cardSurfaceClasses).toContain('rounded-card')
    expect(cardSurfaceClasses).toContain(fieldSurfaceRaisedShadowClasses)
  })
})
