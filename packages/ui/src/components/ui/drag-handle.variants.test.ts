import { describe, expect, it } from 'vitest'

import { dragHandleVariants, dragHandleVisibleWhileDraggingClasses } from './drag-handle.variants'

describe('dragHandleVariants', () => {
  it('composes always-visible CLI chrome with compact icon ghost and grab cursors', () => {
    const classes = dragHandleVariants({ visibility: 'always' })

    expect(classes).toContain('size-control-action-compact')
    expect(classes).toContain('cursor-grab')
    expect(classes).toContain('active:cursor-grabbing')
    expect(classes).not.toContain('opacity-0')
  })

  it('applies hover-reveal wiring for master-detail hosts', () => {
    const classes = dragHandleVariants({ visibility: 'hoverReveal' })

    expect(classes).toContain('size-6')
    expect(classes).toContain('opacity-0')
    expect(classes).toContain('group-hover:opacity-100')
    expect(classes).toContain('group-focus-within:opacity-100')
    expect(classes).toContain('focus-visible:opacity-100')
  })

  it('forces visibility while dragging under hoverReveal', () => {
    const classes = dragHandleVariants({ visibility: 'hoverReveal', dragging: true })

    expect(classes).toContain(dragHandleVisibleWhileDraggingClasses)
  })
})
