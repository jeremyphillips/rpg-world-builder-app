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

Invitee lifecycle notifications (`received`, `cancelled`) share
`campaignInviteInviteeLifecycleDedupeKey(inviteId)` — one slot per invitee per
invite. Manager notifications still use `campaignInviteDedupeKey(inviteId, phase)`.

| Type                        | Recipients                                 | Dedupe key / phase | Action                                                       |
| --------------------------- | ------------------------------------------ | ------------------ | ------------------------------------------------------------ |
| `campaign.invite.received`  | Invitee user when email matches an account | invitee lifecycle  | `campaign_invite_review` → `/app/campaign-invites/:inviteId` |
| `campaign.invite.cancelled` | Invitee user when a pending invite revoked | invitee lifecycle  | None                                                         |
| `campaign.invite.accepted`  | Campaign owner + co-owner, excluding actor | `accepted`         | `campaign_detail`                                            |
| `campaign.invite.completed` | Campaign owner + co-owner, excluding actor | `completed`        | `campaign_detail`                                            |
| `campaign.member.removed`   | Removed player                             | per membership id  | None                                                         |

**Cancellation supersede:** revoking a pending invite upserts the lifecycle row to
`campaign.invite.cancelled`, clears the action, refreshes preview copy, and resets
`readAt` / `seenAt` when the preview materially changed.

**Member removal:** `removeIncompleteCampaignMember` publishes
`campaign.member.removed` to the removed player. Accepted-invite revokes driven by
member removal do **not** publish `campaign.invite.cancelled`.

## HTTP endpoints

All routes require auth and are recipient-scoped.

- `GET /api/notifications?limit=&cursor=&unread=&category=&campaignId=` — filtered
  recent list + **global** `unreadCount`
- `GET /api/notifications/unread-count` — lightweight count (not used by topbar)
- `PATCH /api/notifications/:notificationId/read`
- `POST /api/notifications/mark-all-read` — marks **all** unread for the recipient
  (not scoped to list filters)
- `POST /api/notifications/mark-seen` — body `{ ids: string[] }` for rendered rows only

### List query filters

Optional query params on `GET /api/notifications` (`notificationListQuerySchema`):

| Param        | Effect                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------- |
| `unread`     | When `true`, only rows with `readAt` unset                                                    |
| `category`   | `campaign` \| `message` — matches types via classification vocabulary                         |
| `campaignId` | Keep only notifications that carry that id on `action.campaignId` **or** `payload.campaignId` |

**Campaign exclusion:** when `campaignId` is set, notifications **without** that
campaign id (missing or different) are excluded. Do not treat “no campaign” rows as
in-scope for a scoped inbox.

**`unreadCount`:** always the recipient’s global unread total. List filters change
`items` / `nextCursor` only — they do not change `unreadCount`.

Dashboard inbox wires these through URL-synced filters; do **not** client-filter
cursor pages on the client.

## Deferred gaps

| Gap                    | Status                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `archivedAt` / pruning | Field is stored and excluded from active queries; no archive API or pruning job yet. |

Shipped (not deferred): dashboard inbox cursor pagination; `message.direct.received`
producer (`message-direct:${conversationId}` dedupe; conversation mark-read clears the
row); list filters above.

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
- **Conversation send:** realtime emits only for newly persisted messages. Idempotent
  `clientMessageId` retries return the existing row without re-emitting; clients
  recover via polling, focus refetch, or reconnect sync.

**Single-instance warning:** the default in-memory Socket.IO adapter serves one API
process only. Set `REDIS_URL` to enable the Redis adapter before running multiple API
replicas; sticky sessions alone are insufficient for room fanout.

The dashboard `RealtimeProvider` patches the bell first-page cache directly, invalidates
the separate inbox infinite query when mounted, and keeps slow polling enabled while
connected. Reconnect refetch is scoped to the bell first page, conversation list, active
thread, and mounted inbox — not every cached historical page.

## Campaign invite review actions

`campaign.invite.received` persists `action: { kind: 'campaign_invite_review', inviteId }`.
Navigation uses **`action.inviteId`** as the SSOT; payload `inviteId` is display-only.

Dashboard activation resolves `dashboardCampaignInviteReviewPath(inviteId)` and navigates
within the SPA (no cross-app assign).

### Temporary payload fallback

`resolveNotificationActionPath` falls back to `payload.inviteId` when a stale
`campaign_invite_review` action is missing a valid `inviteId`. Remove when **all** are
true:

1. Persistence schema with `action.inviteId` deployed everywhere.
2. Stale rows cleaned or naturally expired in dev/shared environments.
3. Tests confirm all **new** `campaign.invite.received` actions contain `inviteId`.

Malformed or missing ids mark read only — never navigate to `/undefined`.
