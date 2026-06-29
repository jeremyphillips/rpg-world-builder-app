import { describe, expect, it } from 'vitest'

import { TICKET_PRIORITY_WEIGHT } from './priority-weight'

describe('TICKET_PRIORITY_WEIGHT', () => {
  it('matches legacy priority ordering', () => {
    expect(TICKET_PRIORITY_WEIGHT).toEqual({
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    })
  })
})
