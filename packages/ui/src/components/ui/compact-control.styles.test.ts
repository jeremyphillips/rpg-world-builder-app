import { describe, expect, it } from 'vitest'

import { iconGhostControlVariants } from './icon-ghost-control.variants'
import {
  resolveCompactControlRecipeClasses,
  resolveControlActionGapClass,
} from './compact-control.styles'
import { segmentedControlSegmentVariants } from './segmented-control.variants'

describe('compact-control.styles', () => {
  it('maps recipes to semantic modifier classes', () => {
    expect(resolveCompactControlRecipeClasses('icon-compact')).toBe(
      'ui-compact-control ui-compact-control--icon-compact',
    )
    expect(resolveCompactControlRecipeClasses('text-compact', { includeBlock: false })).toBe(
      'ui-compact-control--text-compact',
    )
  })

  it('maps gap tiers to semantic gap modifiers', () => {
    expect(resolveControlActionGapClass('xs')).toBe('ui-compact-control--gap-xs')
    expect(resolveControlActionGapClass('md')).toBe('ui-compact-control--gap-md')
  })

  it('wires icon ghost and segmented sm through compact control CSS', () => {
    expect(iconGhostControlVariants()).toContain('ui-compact-control--icon-compact')
    expect(segmentedControlSegmentVariants({ size: 'sm' })).toContain(
      'ui-compact-control--segment-sm',
    )
  })
})
