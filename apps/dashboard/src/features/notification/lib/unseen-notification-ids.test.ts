import { describe, expect, it } from 'vitest'

import type { Notification } from '@rpg/contracts'

import { listUnseenNotificationIds } from './unseen-notification-ids'

function makeNotification(
  overrides: Partial<Extract<Notification, { type: 'campaign.invite.accepted' }>> = {},
): Notification {
  return {
    id: 'notification-1',
    type: 'campaign.invite.accepted',
    title: 'Invitation accepted',
    payload: {
      inviteId: 'invite-1',
      campaignId: 'campaign-1',
      campaignName: 'Stormwatch',
      acceptedByDisplayName: 'Ava',
    },
    seenAt: null,
    readAt: null,
    archivedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    version: 1,
    ...overrides,
  }
}

describe('listUnseenNotificationIds', () => {
  it('returns only notifications without seenAt', () => {
    expect(
      listUnseenNotificationIds([
        makeNotification({ id: 'a' }),
        makeNotification({ id: 'b', seenAt: '2026-01-02T00:00:00.000Z' }),
      ]),
    ).toEqual(['a'])
  })
})
