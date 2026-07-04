import { describe, expect, it } from 'vitest'

import { defaultArrayItemHeader } from './array-item-config.lib'
import { arrayItemLabel } from './array-item-label.lib'

describe('arrayItemLabel', () => {
  it('derives from itemHeader fallback when it ends with an index', () => {
    expect(
      arrayItemLabel({ fallback: (index) => `Grant #${index + 1}` }, 'Magic item grants'),
    ).toBe('grant')
  })

  it('falls back to singularized legend when fallback has no index suffix', () => {
    expect(arrayItemLabel(defaultArrayItemHeader('Wealth tiers'), 'Wealth tiers')).toBe(
      'wealth tier',
    )
  })
})
