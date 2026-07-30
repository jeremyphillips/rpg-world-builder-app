import { describe, expect, it } from 'vitest'

import {
  decodeNotificationCursor,
  encodeNotificationCursor,
  previewMateriallyChanged,
} from './notification.repository'

describe('notification cursor helpers', () => {
  it('round-trips cursor values', () => {
    const createdAt = new Date('2026-01-02T12:00:00.000Z')
    const cursor = encodeNotificationCursor(createdAt, '674f2f2f2f2f2f2f2f2f2f2f')
    expect(decodeNotificationCursor(cursor)).toEqual({
      createdAt,
      id: '674f2f2f2f2f2f2f2f2f2f2f',
    })
  })
})

describe('previewMateriallyChanged', () => {
  it('detects title, description, and action changes', () => {
    const existing = {
      title: 'Invitation accepted',
      description: 'Blake accepted your invitation.',
      action: { kind: 'campaign_detail' as const, campaignId: 'campaign-1' },
    }

    expect(
      previewMateriallyChanged(existing, {
        title: 'Invitation accepted',
        description: 'Blake accepted your invitation.',
        action: existing.action,
      }),
    ).toBe(false)

    expect(
      previewMateriallyChanged(existing, {
        title: 'Invitation accepted',
        description: 'Blake accepted your invitation to Stormwatch.',
        action: existing.action,
      }),
    ).toBe(true)
  })
})
