# Notifications (API)

Internal publish API and persistence for durable in-app notifications.

## Architecture

- **Contracts** (`@rpg/contracts/shared/notification*`) own type inventory, classification
  vocab, typed payloads, and public DTO/API shapes.
- **Publish intent** stays API-internal (`publish-notification.types.ts`) and is not
  exported from contracts.
- Domain features call `publishNotification` (or the invite helpers) from
  `apps/api/src/features/notification/index.ts` only — never the repository directly.

## Publishing

`publishNotification` validates payloads against contracts schemas, formats preview
snapshots through `notification.registry.ts`, and persists rows per recipient.

```ts
await publishNotification({
  type: 'campaign.invite.accepted',
  recipientUserIds: managerUserIds,
  dedupeKey: `campaign-invite:${inviteId}:accepted`,
  payload: {
    inviteId,
    campaignId,
    campaignName,
    acceptedByDisplayName,
  },
})
```

Producer failures are best-effort: invite and onboarding flows log and continue.

## Dedupe policy

When `dedupeKey` is present, the service upserts per recipient using the unique
partial index on `{ recipientUserId, dedupeKey }`.

- Always refresh payload, preview snapshots, action, and timestamps.
- Reset `readAt` / `seenAt` only when title, description, or action materially
  change. Identical invite resends keep prior read state.

## Campaign invite producers

| Type                        | Recipients                                 | Dedupe key                             | Action                      |
| --------------------------- | ------------------------------------------ | -------------------------------------- | --------------------------- |
| `campaign.invite.received`  | Invitee user when email matches an account | `campaign-invite:{inviteId}:received`  | None — copy points to email |
| `campaign.invite.accepted`  | Campaign owner + co-owner, excluding actor | `campaign-invite:{inviteId}:accepted`  | `campaign_detail`           |
| `campaign.invite.completed` | Campaign owner + co-owner, excluding actor | `campaign-invite:{inviteId}:completed` | `campaign_detail`           |

## HTTP endpoints

All routes require auth and are recipient-scoped.

- `GET /api/notifications?limit=&cursor=` — recent list + `unreadCount`
- `GET /api/notifications/unread-count` — lightweight count (not used by topbar)
- `PATCH /api/notifications/:notificationId/read`
- `POST /api/notifications/mark-all-read`
- `POST /api/notifications/mark-seen` — body `{ ids: string[] }` for rendered rows only

## Retention

Phase 1 keeps notifications indefinitely. Recipient + `createdAt` indexes support a
future pruning job (for example archive/delete read rows older than N days) without
schema changes.

## Reserved fields

`groupKey` is intentionally omitted from Phase 1 storage and queries. Reserve it for
later invite lifecycle grouping UI.

## Socket.IO follow-up

When realtime delivery lands, emit after persistence and update the same dashboard list
query cache the poller uses. Polling remains authoritative after reconnect.
