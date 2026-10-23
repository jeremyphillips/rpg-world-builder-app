import { describe, expect, it } from 'vitest'

import {
  interactiveRowVariants,
  selectableRowHighlightFillClasses,
  selectableRowPointerHoverClasses,
} from './interactive-row.variants'

describe('selectable row recipe constants', () => {
  it('uses semantic row classes for pointer and highlight fills', () => {
    expect(selectableRowPointerHoverClasses).toContain('ui-interactive-row--hover')
    expect(selectableRowHighlightFillClasses).toBe('ui-interactive-row--highlight')
    expect(selectableRowPointerHoverClasses).not.toContain('control-hover')
  })
})

describe('interactiveRowVariants', () => {
  it('applies shared surface hover for hoverable rows', () => {
    expect(interactiveRowVariants({ interaction: 'hoverable' })).toContain(
      'ui-interactive-row--hover',
    )
  })

  it('omits hover modifier when interaction is static', () => {
    expect(interactiveRowVariants({ interaction: 'static' })).not.toContain(
      'ui-interactive-row--hover',
    )
  })

  it('encodes bordered selection fill', () => {
    const classes = interactiveRowVariants({
      selected: 'bordered',
      interaction: 'static',
    })

    expect(classes).toContain('ui-interactive-row--selected-bordered')
    expect(classes).not.toContain('ui-interactive-row--hover')
  })

  it('supports data-driven selection for table and radio rows', () => {
    expect(interactiveRowVariants({ selectedData: 'selected' })).toContain(
      'ui-interactive-row--data-selected',
    )
    expect(interactiveRowVariants({ selectedData: 'checked' })).toContain(
      'ui-interactive-row--data-checked',
    )
  })

  it('applies inactive state independently of hover', () => {
    expect(interactiveRowVariants({ state: 'inactive' })).toContain(
      'ui-interactive-row--state-inactive',
    )
    expect(interactiveRowVariants({ state: 'inactive' })).toContain('ui-border--subtle')
  })

  it('applies pointer cursor when the row is an explicit hit target', () => {
    expect(interactiveRowVariants({ hitTarget: 'pointer' })).toContain(
      'ui-interactive-row--hit-pointer',
    )
    expect(interactiveRowVariants({ hitTarget: 'none' })).toContain('ui-interactive-row--hit-none')
    expect(interactiveRowVariants({ hitTarget: 'none' })).not.toContain(
      'ui-interactive-row--hit-pointer',
    )
  })
})
