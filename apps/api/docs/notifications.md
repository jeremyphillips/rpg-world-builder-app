# Notifications (API)

Internal publish API and persistence for durable in-app notifications.

## Architecture

- **Contracts** (`@rpg/contracts/shared/notification*`) own type inventory, classification
  vocab (`NOTIFICATION_CLASSIFICATION_BY_TYPE`), typed payloads, and public DTO/API shapes.
- **Publish intent** stays API-internal (`publish-notification.types.ts`) and is not
  exported from contracts.
- Domain features call `publishNotification` (or the invite helpers) from
  `apps/api/src/features/notification/index.ts` only — never the repository directly.
- Registry formatters import classification defaults from contracts via
  `getNotificationClassification`.

## Publishing

`publishNotification` validates payloads against contracts schemas, formats preview
snapshots through `notification.registry.ts`, and persists rows per recipient.

```ts
await publishNotification({
  type: 'campaign.invite.accepted',
  recipientUserIds: managerUserIds,
  dedupeKey: campaignInviteDedupeKey(inviteId, 'accepted'),
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

Dedupe keys use `campaignInviteDedupeKey(inviteId, phase)` from
`notification-dedupe-keys.ts`.

| Type                        | Recipients                                 | Dedupe phase | Action                      |
| --------------------------- | ------------------------------------------ | ------------ | --------------------------- |
| `campaign.invite.received`  | Invitee user when email matches an account | `received`   | None — copy points to email |
| `campaign.invite.accepted`  | Campaign owner + co-owner, excluding actor | `accepted`   | `campaign_detail`           |
| `campaign.invite.completed` | Campaign owner + co-owner, excluding actor | `completed`  | `campaign_detail`           |

## HTTP endpoints

All routes require auth and are recipient-scoped.

- `GET /api/notifications?limit=&cursor=` — recent list + `unreadCount`
- `GET /api/notifications/unread-count` — lightweight count (not used by topbar)
- `PATCH /api/notifications/:notificationId/read`
- `POST /api/notifications/mark-all-read`
- `POST /api/notifications/mark-seen` — body `{ ids: string[] }` for rendered rows only

## Phase 1 deferred gaps

| Gap                                | Status                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `nextCursor` pagination            | List endpoint returns `nextCursor`; dashboard polls only the first page.                                                            |
| `message.direct.received` producer | Published on direct message send with dedupe key `message-direct:${conversationId}`; conversation mark-read clears the deduped row. |
| `archivedAt` / pruning             | Field is stored and excluded from active queries; no archive API or pruning job yet.                                                |

## Retention

Phase 1 keeps notifications indefinitely. Recipient + `createdAt` indexes support a
future pruning job (for example archive/delete read rows older than N days) without
schema changes.

## Reserved fields

`groupKey` is intentionally omitted from Phase 1 storage and queries. Reserve it for
later invite lifecycle grouping UI.

## Socket.IO delivery

Realtime fanout runs **after persistence** through `apps/api/src/realtime/` — domain
services call delivery helpers (`deliverNotificationUpserted`, `deliverNotificationRead`,
`deliverConversationActivity`) and never emit to rooms directly.

| Event                   | Payload                                                                                 | When                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `notification.upserted` | `{ notification, unreadCount, version }`                                                | After insert or dedupe refresh                         |
| `notification.read`     | `{ notification, unreadCount, version }` or `{ notificationIds, unreadCount, version }` | After mark-read / mark-all / conversation-synced read  |
| `conversation.activity` | `{ conversation, message?, version }`                                                   | After send or mark-read (one envelope per participant) |

Rules:

- No `notification.created` for dedupe upserts.
- No emit on mark-seen / `seenAt`-only writes.
- Every payload includes monotonic `version` for cache guards (row revision on notifications; per-participant projection revision on conversations).
- Handshake auth reuses the `rpg_session` cookie; connections join `user:{userId}` only.

**Single-instance warning:** the default in-memory Socket.IO adapter serves one API
process only. Set `REDIS_URL` to enable the Redis adapter before running multiple API
replicas; sticky sessions alone are insufficient for room fanout.

The dashboard `RealtimeProvider` patches the bell first-page cache directly, invalidates
the separate inbox infinite query when mounted, and keeps slow polling enabled while
connected. Reconnect refetch is scoped to the bell first page, conversation list, active
thread, and mounted inbox — not every cached historical page.
