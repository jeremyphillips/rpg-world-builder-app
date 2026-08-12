import { describe, expect, it } from 'vitest'

import { interactiveFocusVariants } from './interactive-focus.variants'

describe('interactiveFocusVariants', () => {
  it('applies full ring stack for standalone context', () => {
    const classes = interactiveFocusVariants({ context: 'standalone' })

    expect(classes).toContain('focus-visible:outline-none')
    expect(classes).toContain('focus-visible:ring-2')
    expect(classes).toContain('focus-visible:ring-ring')
    expect(classes).toContain('focus-visible:ring-offset-2')
    expect(classes).toContain('focus-visible:ring-offset-background')
  })

  it('omits ring offset for embedded context', () => {
    const classes = interactiveFocusVariants({ context: 'embedded' })

    expect(classes).toContain('focus-visible:ring-2')
    expect(classes).not.toContain('focus-visible:ring-offset-2')
    expect(classes).not.toContain('focus-visible:ring-offset-background')
  })
})
