import { describe, expect, it } from 'vitest'

import { resolveReplacementFieldLabels } from './entity-replacement-field-labels'

describe('resolveReplacementFieldLabels', () => {
  it('derives current and new labels from singular entity label', () => {
    expect(resolveReplacementFieldLabels('Location')).toEqual({
      currentLabel: 'Current location',
      newLabel: 'New location',
    })
  })
})
