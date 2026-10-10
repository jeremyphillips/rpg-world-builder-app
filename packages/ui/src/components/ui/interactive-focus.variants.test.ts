import { describe, expect, it } from 'vitest'

import { interactiveFocusVariants } from './interactive-focus.variants'

describe('interactiveFocusVariants', () => {
  it('applies standalone focus ring classes', () => {
    const classes = interactiveFocusVariants({ context: 'standalone' })

    expect(classes).toContain('ui-focus-ring')
    expect(classes).not.toContain('ui-focus-ring--embedded')
  })

  it('applies embedded focus ring modifier', () => {
    const classes = interactiveFocusVariants({ context: 'embedded' })

    expect(classes).toContain('ui-focus-ring')
    expect(classes).toContain('ui-focus-ring--embedded')
  })
})
