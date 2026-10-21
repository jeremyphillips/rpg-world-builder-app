import { describe, expect, it } from 'vitest'

import { dividedStackVariants } from './divided-stack.variants'

describe('dividedStackVariants', () => {
  it('maps compact density to balanced sibling spacing', () => {
    const classes = dividedStackVariants({ density: 'compact' })
    expect(classes).toContain('[&>*+*]:mt-2')
    expect(classes).toContain('[&>*+*]:pt-2')
  })

  it('maps comfortable density to balanced sibling spacing', () => {
    const classes = dividedStackVariants({ density: 'comfortable' })
    expect(classes).toContain('[&>*+*]:mt-4')
    expect(classes).toContain('[&>*+*]:pt-4')
  })

  it('maps spacious density to comfortable spacing until a distinct rhythm exists', () => {
    const classes = dividedStackVariants({ density: 'spacious' })
    expect(classes).toContain('[&>*+*]:mt-4')
    expect(classes).toContain('[&>*+*]:pt-4')
  })

  it('applies the structural sibling divider selector and subtle border token', () => {
    const classes = dividedStackVariants()
    expect(classes).toContain('[&>*+*]:border-t')
    expect(classes).toContain('[&>*+*]:border-border-subtle')
    expect(classes).toContain('flex')
    expect(classes).toContain('flex-col')
    expect(classes).toContain('min-w-0')
    expect(classes).toContain('w-full')
  })
})
