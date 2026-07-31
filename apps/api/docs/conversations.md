# Conversations (API)

Direct one-to-one conversations between users who share current campaign
membership.

## Endpoints

```text
POST   /api/conversations/direct
GET    /api/conversations/direct/recipients
GET    /api/conversations
GET    /api/conversations/:conversationId/messages
POST   /api/conversations/:conversationId/messages
PATCH  /api/conversations/:conversationId/read
```

All routes require authentication. Conversation access is limited to
`participantUserIds`.

## Recipient eligibility

Recipients are resolved from **current** shared campaign membership:

- Campaign `owner` / `co-owner` callers can message any current member of campaigns
  they manage.
- `pc` / `observer` callers can message other current members in shared campaigns.
  PC↔PC pairs require active open participation (or completed onboarding membership)
  so inactive or historical relationships are excluded.

The same rules apply to `GET /direct/recipients` and `POST /direct`.

## Unread state

Unread counts are derived from `lastReadMessageId` on per-user participant state.
`lastReadAt` is denormalized convenience only. Messages are compared by
`createdAt` then `_id` so equal timestamps do not misclassify unread rows.

## Send orchestration

- `clientMessageId` is optional and idempotent per `(conversationId, senderUserId)`.
- Message persistence and `latestMessage` preview updates use compare-and-set so an
  older concurrent send cannot overwrite a newer preview.
- Sending does **not** mark the sender's conversation read.

## Notifications

After a new message is persisted, the API best-effort publishes
`message.direct.received` to the other participant using dedupe key
`message-direct:${conversationId}`.

- Payload includes `unreadMessageCount` for the recipient after the send.
- Dedupe upserts refresh preview snapshots and reset `readAt` / `seenAt` when the
  count or preview materially changes.
- `PATCH /read` also marks the deduped notification read for the viewer.

Producer failures are logged and do not fail the message send.

## Deferred

- Archive endpoint/UI (`archivedAt` on participant state)
- Message edit/delete HTTP
- `mutedAt` / mute suppression
- Socket.IO delivery

See also: [`notifications.md`](./notifications.md) for registry copy and dedupe
policy details.
