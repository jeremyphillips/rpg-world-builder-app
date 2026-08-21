import { describe, expect, it } from 'vitest'

import { entitySurfaceInsetVariants } from './entity-surface-inset.variants'

describe('entitySurfaceInsetVariants', () => {
  it('uses full density inset on both edges when no leading chrome is present', () => {
    expect(entitySurfaceInsetVariants({ density: 'compact', leading: false })).toContain(
      '[--entity-surface-inline-start:calc(var(--spacing)*3)]',
    )
    expect(entitySurfaceInsetVariants({ density: 'compact', leading: false })).toContain(
      '[--entity-surface-inline-end:calc(var(--spacing)*3)]',
    )
    expect(entitySurfaceInsetVariants({ density: 'comfortable', leading: false })).toContain(
      '[--entity-surface-inline-start:calc(var(--spacing)*5)]',
    )
  })

  it('reduces start inset only when leading chrome is present', () => {
    expect(entitySurfaceInsetVariants({ density: 'compact', leading: true })).toContain(
      '[--entity-surface-inline-start:calc(var(--spacing)*1)]',
    )
    expect(entitySurfaceInsetVariants({ density: 'compact', leading: true })).toContain(
      '[--entity-surface-inline-end:calc(var(--spacing)*3)]',
    )
    expect(entitySurfaceInsetVariants({ density: 'comfortable', leading: true })).toContain(
      '[--entity-surface-inline-start:calc(var(--spacing)*2)]',
    )
    expect(entitySurfaceInsetVariants({ density: 'comfortable', leading: true })).toContain(
      '[--entity-surface-inline-end:calc(var(--spacing)*5)]',
    )
  })
})
