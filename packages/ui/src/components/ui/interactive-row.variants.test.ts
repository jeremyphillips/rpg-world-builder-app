import { describe, expect, it } from 'vitest'

import {
  interactiveRowVariants,
  selectableRowHighlightFillClasses,
  selectableRowPointerHoverClasses,
} from './interactive-row.variants'

describe('selectable row recipe constants', () => {
  it('uses semantic row classes for pointer and highlight fills', () => {
    expect(selectableRowPointerHoverClasses).toContain('ui-interactive-row--hover-selectable')
    expect(selectableRowHighlightFillClasses).toBe('ui-interactive-row--highlight')
    expect(selectableRowPointerHoverClasses).not.toContain('control-hover')
  })
})

describe('interactiveRowVariants', () => {
  it('applies selectable row hover for editor/selection contexts', () => {
    expect(
      interactiveRowVariants({ interaction: 'hoverable', hoverFamily: 'selectable' }),
    ).toContain('ui-interactive-row--hover-selectable')
  })

  it('applies navigation row hover for destination/link surfaces', () => {
    expect(
      interactiveRowVariants({ interaction: 'hoverable', hoverFamily: 'navigation' }),
    ).toContain('ui-interactive-row--hover-navigation')
    expect(
      interactiveRowVariants({ interaction: 'hoverable', hoverFamily: 'navigation' }),
    ).not.toContain('ui-interactive-row--hover-selectable')
  })

  it('encodes bordered selection with selected hover fill', () => {
    const classes = interactiveRowVariants({
      selected: 'bordered',
      selectedHover: 'row',
      hoverFamily: 'none',
    })

    expect(classes).toContain('ui-interactive-row--selected-bordered')
    expect(classes).toContain('ui-interactive-row--hover-selected')
    expect(classes).not.toContain('ui-interactive-row--hover-selectable')
  })

  it('supports data-driven selection for table and radio rows', () => {
    expect(interactiveRowVariants({ selectedData: 'selected' })).toContain(
      'ui-interactive-row--data-selected',
    )
    expect(interactiveRowVariants({ selectedData: 'checked' })).toContain(
      'ui-interactive-row--data-checked',
    )
  })

  it('applies inactive state independently of hover family', () => {
    expect(interactiveRowVariants({ state: 'inactive' })).toContain(
      'ui-interactive-row--state-inactive',
    )
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
