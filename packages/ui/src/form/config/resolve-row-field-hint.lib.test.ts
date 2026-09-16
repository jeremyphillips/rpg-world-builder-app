import { describe, expect, it } from 'vitest'

import { resolveRowAwareFieldHintPresentation } from './resolve-row-field-hint.lib'

describe('resolveRowAwareFieldHintPresentation', () => {
  it('keeps below-label placement outside anatomy rows', () => {
    const result = resolveRowAwareFieldHintPresentation(
      { hint: { text: 'Help', position: 'below-label' } },
      {},
      false,
    )
    expect(result.position).toBe('below-label')
  })

  it('normalizes hints to below-control inside anatomy rows', () => {
    const result = resolveRowAwareFieldHintPresentation({ hint: 'Help' }, {}, true)
    expect(result).toEqual({ text: 'Help', position: 'below-control' })
  })
})
