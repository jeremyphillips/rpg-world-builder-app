import { describe, expect, it } from 'vitest'

import { iconContainerVariants } from './icon-container.variants'

describe('iconContainerVariants', () => {
  it('uses rounded-md for box shape by default', () => {
    expect(iconContainerVariants()).toContain('rounded-md')
    expect(iconContainerVariants({ shape: 'box' })).toContain('rounded-md')
  })

  it('uses rounded-full for circle shape', () => {
    expect(iconContainerVariants({ shape: 'circle' })).toContain('rounded-full')
    expect(iconContainerVariants({ shape: 'circle' })).not.toContain('rounded-md')
  })

  it('uses the strong surface plane by default', () => {
    expect(iconContainerVariants()).toContain('bg-surface-strong')
    expect(iconContainerVariants()).toContain('[--surface-current:var(--surface-strong)]')
  })
})
