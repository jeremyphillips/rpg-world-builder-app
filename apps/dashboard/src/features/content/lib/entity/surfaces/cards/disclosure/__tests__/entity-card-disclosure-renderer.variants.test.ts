import { describe, expect, it } from 'vitest'

import { DASH_ENTITY_CARD_BODY_CLASS } from '../../../dash-entity-surface.variants'

describe('entity card disclosure body wash', () => {
  it('uses dash-entity-card body anatomy for expanded wash', () => {
    const wash = 'dash-entity-card__body dash-entity-card__body--disclosure-wash'
    expect(wash).toContain(DASH_ENTITY_CARD_BODY_CLASS)
    expect(wash).toContain('dash-entity-card__body--disclosure-wash')
  })
})
