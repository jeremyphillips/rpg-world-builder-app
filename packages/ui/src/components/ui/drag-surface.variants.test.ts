import { describe, expect, it } from 'vitest'

import { dragSurfaceDraggingOpacityClasses, dragSurfaceVariants } from './drag-surface.variants'

describe('dragSurfaceVariants', () => {
  it('applies standard dragging opacity', () => {
    expect(dragSurfaceVariants({ dragging: true })).toBe(dragSurfaceDraggingOpacityClasses)
    expect(dragSurfaceDraggingOpacityClasses).toBe('opacity-50')
  })

  it('returns empty classes when not dragging', () => {
    expect(dragSurfaceVariants({ dragging: false })).toBe('')
  })
})
