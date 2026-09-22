import { describe, expect, it } from 'vitest'

import { foundationCollection } from './foundation'

describe('foundation narrative collection', () => {
  it('loads validated authored fragments', () => {
    expect(foundationCollection.fragments.length).toBeGreaterThan(80)
  })
})
