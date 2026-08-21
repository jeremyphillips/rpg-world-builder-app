import { describe, expect, it } from 'vitest'

import {
  ENTITY_UTILITY_GAP_VALUE,
  ENTITY_UTILITY_SIZE_VALUE,
  resolveEntityLeadingGeometry,
} from './entity-leading-geometry.lib'

describe('resolveEntityLeadingGeometry', () => {
  it('returns zero offset and content gap when count is 0', () => {
    expect(resolveEntityLeadingGeometry({ count: 0, density: 'compact' })).toEqual({
      utilitySize: ENTITY_UTILITY_SIZE_VALUE,
      utilityGap: ENTITY_UTILITY_GAP_VALUE,
      contentGap: '0px',
      contentOffset: '0px',
    })
  })

  it('includes utility size and density content gap for caret-only rows', () => {
    expect(resolveEntityLeadingGeometry({ count: 1, density: 'compact' })).toEqual({
      utilitySize: ENTITY_UTILITY_SIZE_VALUE,
      utilityGap: ENTITY_UTILITY_GAP_VALUE,
      contentGap: 'calc(var(--spacing)*2)',
      contentOffset: `calc(${ENTITY_UTILITY_SIZE_VALUE} + calc(var(--spacing)*2))`,
    })

    expect(resolveEntityLeadingGeometry({ count: 1, density: 'comfortable' })).toMatchObject({
      contentGap: 'calc(var(--spacing)*3)',
      contentOffset: `calc(${ENTITY_UTILITY_SIZE_VALUE} + calc(var(--spacing)*3))`,
    })
  })

  it('sums two utility columns plus content gap for grip and caret', () => {
    expect(resolveEntityLeadingGeometry({ count: 2, density: 'compact' })).toEqual({
      utilitySize: ENTITY_UTILITY_SIZE_VALUE,
      utilityGap: ENTITY_UTILITY_GAP_VALUE,
      contentGap: 'calc(var(--spacing)*2)',
      contentOffset: `calc(2 * ${ENTITY_UTILITY_SIZE_VALUE} + 1 * ${ENTITY_UTILITY_GAP_VALUE} + calc(var(--spacing)*2))`,
    })
  })
})
