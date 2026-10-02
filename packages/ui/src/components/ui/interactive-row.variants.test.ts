import { describe, expect, it } from 'vitest'

import {
  interactiveRowVariants,
  selectableRowHighlightFillClasses,
  selectableRowMenuHighlightFillClasses,
  selectableRowPointerHoverClasses,
} from './interactive-row.variants'

describe('selectable row recipe constants', () => {
  it('uses row-hover for pointer, highlight, and menu highlight fills', () => {
    expect(selectableRowPointerHoverClasses).toBe('hover:bg-row-hover')
    expect(selectableRowHighlightFillClasses).toBe('bg-row-hover')
    expect(selectableRowMenuHighlightFillClasses).toContain('data-[highlighted]:bg-row-hover')
    expect(selectableRowPointerHoverClasses).not.toContain('control-hover')
  })
})

describe('interactiveRowVariants', () => {
  it('applies selectable row hover for editor/selection contexts', () => {
    expect(
      interactiveRowVariants({ interaction: 'hoverable', hoverFamily: 'selectable' }),
    ).toContain('hover:bg-row-hover')
  })

  it('applies navigation row hover for destination/link surfaces', () => {
    expect(
      interactiveRowVariants({ interaction: 'hoverable', hoverFamily: 'navigation' }),
    ).toContain('hover:bg-muted')
    expect(
      interactiveRowVariants({ interaction: 'hoverable', hoverFamily: 'navigation' }),
    ).not.toContain('hover:bg-row-hover')
  })

  it('encodes bordered selection with selected hover fill', () => {
    const classes = interactiveRowVariants({
      selected: 'bordered',
      selectedHover: 'row',
      hoverFamily: 'none',
    })

    expect(classes).toContain('border-row-selected-border')
    expect(classes).toContain('bg-row-selected')
    expect(classes).toContain('hover:bg-row-selected')
    expect(classes).not.toContain('hover:bg-row-hover')
  })

  it('supports data-driven selection for table and radio rows', () => {
    expect(interactiveRowVariants({ selectedData: 'selected' })).toContain(
      'data-[state=selected]:bg-row-selected',
    )
    expect(interactiveRowVariants({ selectedData: 'checked' })).toContain(
      'data-[state=checked]:bg-row-selected',
    )
  })

  it('applies inactive state independently of hover family', () => {
    expect(interactiveRowVariants({ state: 'inactive' })).toContain('border-dashed')
  })

  it('applies pointer cursor when the row is an explicit hit target', () => {
    expect(interactiveRowVariants({ hitTarget: 'pointer' })).toContain('cursor-pointer')
    expect(interactiveRowVariants({ hitTarget: 'none' })).not.toContain('cursor-pointer')
  })
})
