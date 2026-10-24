import { describe, expect, it } from 'vitest'

import { iconContainerVariants } from './icon-container.variants'

describe('iconContainerVariants', () => {
  it('uses box shape modifiers by default', () => {
    expect(iconContainerVariants()).toContain('ui-identity-frame--shape-box')
    expect(iconContainerVariants({ shape: 'box' })).toContain('ui-identity-frame--shape-box')
  })

  it('uses circle shape modifiers', () => {
    expect(iconContainerVariants({ shape: 'circle' })).toContain('ui-identity-frame--shape-circle')
    expect(iconContainerVariants({ shape: 'circle' })).not.toContain('ui-identity-frame--shape-box')
  })

  it('uses the strong surface plane by default', () => {
    expect(iconContainerVariants()).toContain('bg-surface-strong')
    expect(iconContainerVariants()).toContain('[--surface-current:var(--surface-strong)]')
  })

  it('defaults to the compact sm footprint', () => {
    expect(iconContainerVariants()).toContain('ui-identity-frame--sm')
  })

  it('supports the larger md footprint', () => {
    expect(iconContainerVariants({ size: 'md' })).toContain('ui-identity-frame--md')
    expect(iconContainerVariants({ size: 'md' })).toContain('ui-icon-container--md')
  })
})
