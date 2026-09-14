import { describe, expect, it } from 'vitest'

import { resolveBroadAvailabilityPresentation } from './broad-availability-summary.lib'

describe('resolveBroadAvailabilityPresentation', () => {
  it('returns broad available copy without player-access detail', () => {
    expect(resolveBroadAvailabilityPresentation(true)).toEqual({
      statusLabel: 'Available',
      indicator: 'dot',
      tone: 'success',
    })
  })

  it('returns broad unavailable copy without player-access detail', () => {
    expect(resolveBroadAvailabilityPresentation(false)).toEqual({
      statusLabel: 'Unavailable',
      indicator: 'inactive',
      tone: 'warning',
    })
  })
})
