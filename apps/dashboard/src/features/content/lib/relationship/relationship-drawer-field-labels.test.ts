import { describe, expect, it } from 'vitest'

import { RELATIONSHIP_DRAWER_LOCATION_FIELD_LABEL } from './relationship-drawer-field-labels'
import { resolveReplacementFieldLabels } from './relationship-drawer-field-labels'

describe('resolveReplacementFieldLabels', () => {
  it('derives current and new labels from singular entity label', () => {
    expect(resolveReplacementFieldLabels(RELATIONSHIP_DRAWER_LOCATION_FIELD_LABEL)).toEqual({
      currentLabel: 'Current location',
      newLabel: 'New location',
    })
  })
})
