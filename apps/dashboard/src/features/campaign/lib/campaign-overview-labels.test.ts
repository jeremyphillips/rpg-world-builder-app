import { ApiError } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { formatInvitationStatusLine, mapInviteSendError } from './campaign-overview-labels'

describe('campaign overview labels', () => {
  it('formats sent invitation status with sent and expiry lines', () => {
    expect(
      formatInvitationStatusLine({
        deliveryStatus: 'sent',
        sentAt: '2026-07-25T12:00:00.000Z',
        expiresAt: '2026-08-02T00:00:00.000Z',
      }),
    ).toMatch(/Sent .* · Expires/)
  })

  it('formats failed delivery without a sent line', () => {
    expect(
      formatInvitationStatusLine({
        deliveryStatus: 'failed',
        expiresAt: '2026-08-02T00:00:00.000Z',
      }),
    ).toMatch(/Email not sent · Expires/)
  })

  it('maps invite send domain errors to UI copy', () => {
    const mapped = mapInviteSendError(new ApiError(429, 'cooldown', 'Cooldown'))

    expect(mapped).toBe('An invitation was sent recently. Try again in a minute.')
  })
})
