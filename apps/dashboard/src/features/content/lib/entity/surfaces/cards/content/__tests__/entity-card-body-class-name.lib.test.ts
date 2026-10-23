import { describe, expect, it } from 'vitest'

import { entityCardBodyClassName } from '../entity-card-body-class-name.lib'

describe('entityCardBodyClassName', () => {
  it('returns disclosure and catalog wash pairs', () => {
    expect(entityCardBodyClassName('disclosure')).toBe(
      'dash-entity-card__body dash-entity-card__body--disclosure-wash ui-border--subtle',
    )
    expect(entityCardBodyClassName('catalog')).toBe(
      'dash-entity-card__body dash-entity-card__body--catalog-wash ui-border--subtle',
    )
  })
})
