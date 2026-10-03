import { describe, expect, it } from 'vitest'

import { entitySurfaceInsetVariants } from '../entity-surface-inset.variants'

describe('entitySurfaceInsetVariants', () => {
  it('publishes base and utility inset values per density', () => {
    expect(entitySurfaceInsetVariants({ density: 'compact' })).toContain(
      '[--entity-surface-inset:calc(var(--spacing)*4)]',
    )
    expect(entitySurfaceInsetVariants({ density: 'compact' })).toContain(
      '[--entity-surface-utility-inset:calc(var(--spacing)*1)]',
    )
    expect(entitySurfaceInsetVariants({ density: 'comfortable' })).toContain(
      '[--entity-surface-inset:calc(var(--spacing)*5)]',
    )
    expect(entitySurfaceInsetVariants({ density: 'comfortable' })).toContain(
      '[--entity-surface-utility-inset:calc(var(--spacing)*2)]',
    )
  })

  it('uses the base inset on both edges by default', () => {
    const classes = entitySurfaceInsetVariants({ density: 'compact' })
    expect(classes).toContain('[--entity-surface-inline-start:var(--entity-surface-inset)]')
    expect(classes).toContain('[--entity-surface-inline-end:var(--entity-surface-inset)]')
  })

  it('tightens each edge independently', () => {
    const start = entitySurfaceInsetVariants({ density: 'compact', start: 'utility' })
    expect(start).toContain('[--entity-surface-inline-start:var(--entity-surface-utility-inset)]')
    expect(start).toContain('[--entity-surface-inline-end:var(--entity-surface-inset)]')

    const end = entitySurfaceInsetVariants({ density: 'comfortable', end: 'utility' })
    expect(end).toContain('[--entity-surface-inline-start:var(--entity-surface-inset)]')
    expect(end).toContain('[--entity-surface-inline-end:var(--entity-surface-utility-inset)]')
  })
})
