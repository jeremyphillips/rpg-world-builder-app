import { describe, expect, it } from 'vitest'

import { actionResolutionListVariants } from './action-resolution-list.variants'

describe('actionResolutionListVariants', () => {
  it('uses the lighter-than-modal surface token', () => {
    expect(actionResolutionListVariants()).toContain('bg-surface-subtle')
    expect(actionResolutionListVariants()).not.toContain('bg-sunken')
  })
})
