import { ApiError } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { formatInvitationStatusLine, mapInviteSendError } from './campaign-overview-labels'

describe('campaign overview labels', () => {
  it('formats pending invitation status with expiry', () => {
    expect(formatInvitationStatusLine('sent', '2026-08-02T00:00:00.000Z')).toMatch(
      /Pending · Expires/,
    )
  })

  it('maps invite send domain errors to UI copy', () => {
    const mapped = mapInviteSendError(new ApiError(429, 'cooldown', 'Cooldown'))

    expect(mapped).toBe('An invitation was sent recently. Try again in a minute.')
  })
})
