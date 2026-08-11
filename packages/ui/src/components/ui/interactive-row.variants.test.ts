import { describe, expect, it } from 'vitest'

import { interactiveRowVariants } from './interactive-row.variants'

describe('interactiveRowVariants', () => {
  it('applies row hover for hoverable default rows', () => {
    expect(interactiveRowVariants({ interaction: 'hoverable', hoverTone: 'row' })).toContain(
      'hover:bg-row-hover',
    )
  })

  it('preserves muted hover hosts without swapping to row-hover', () => {
    expect(interactiveRowVariants({ interaction: 'hoverable', hoverTone: 'muted' })).toContain(
      'hover:bg-muted',
    )
    expect(interactiveRowVariants({ interaction: 'hoverable', hoverTone: 'muted' })).not.toContain(
      'hover:bg-row-hover',
    )
  })

  it('encodes bordered selection with selected hover fill', () => {
    const classes = interactiveRowVariants({
      selected: 'bordered',
      selectedHover: 'row',
      hoverTone: 'none',
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

  it('applies inactive and dragging axes independently', () => {
    expect(interactiveRowVariants({ state: 'inactive' })).toContain('border-dashed')
    expect(interactiveRowVariants({ dragging: true })).toContain('opacity-50')
  })
})
