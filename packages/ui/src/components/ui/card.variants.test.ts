import { describe, expect, it } from 'vitest'

import { cardSurfaceClasses } from './card.variants'
import { fieldSurfaceRaisedShadowClasses } from './field-surface.variants'

describe('cardSurfaceClasses', () => {
  it('includes card fill and raised surface shadow', () => {
    expect(cardSurfaceClasses).toContain('bg-card')
    expect(cardSurfaceClasses).toContain('rounded-card')
    expect(cardSurfaceClasses).toContain(fieldSurfaceRaisedShadowClasses)
  })
})
