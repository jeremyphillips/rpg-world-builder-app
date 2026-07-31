# message (dashboard feature)

Direct one-to-one conversations with campaign-member recipient discovery. TanStack
Query polling plus Socket.IO cache patches keep list and active thread fresh.

## Ownership vs campaign context

Direct messaging is **globally owned** by the user workspace — not by a campaign.
Optional `campaignId` on `/messages` URLs narrows discovery and presentation only;
it never changes conversation identity, authz, or routes under `/campaigns/...`.

Campaign-owned channels and a Direct | Campaigns mode switch are reserved for a
future phase when the API can create and return `kind: 'campaign'` conversations.
Until then, legacy `?mode=campaigns` URLs redirect to the unscoped workspace.

## Layout

| Path                                   | Responsibility                                  |
| -------------------------------------- | ----------------------------------------------- |
| `api/conversations.ts`                 | Same-origin conversation API client             |
| `hooks/use-conversations.ts`           | Conversation list query with poll-while-visible |
| `hooks/use-conversation-messages.ts`   | Infinite message pages for a thread             |
| `hooks/use-conversation-recipients.ts` | Active campaign-member picker data              |
| `hooks/use-conversation-actions.ts`    | Create, send, mark-read mutations               |
| `lib/messages-copy.ts`                 | User-facing copy constants and formatters       |
| `lib/conversation-query-keys.ts`       | Shared query keys                               |
| `lib/conversation-cache.ts`            | List/thread cache helpers + version guards      |
| `lib/sort-messages-chronologically.ts` | Newest-first API pages → chronological render   |
| `routes/messages-list.tsx`             | Conversation index                              |
| `routes/new-message.tsx`               | Recipient picker + create/find                  |
| `routes/message-thread.tsx`            | Thread view, composer, mark-read while open     |

## Polling rules

- List and thread queries run only when a session user exists.
- `refetchInterval` is active while `document.visibilityState === 'visible'`.
- Fast poll while disconnected; slow poll (90s list / 60s thread) while socket-connected.
- `refetchOnWindowFocus: true` recovers after backgrounding.

## Conversation list pagination (deferred)

The API returns `nextCursor` for conversation lists and the client accepts a
`cursor` parameter, but Phase 1 only fetches the first page (`limit: 20`) in
`use-conversations.ts`. Conversations beyond that page are not shown until
load-more or infinite-scroll UI is wired.

## Mark-read contract

The thread route marks the conversation read when it is open and the latest
rendered message changes. Sending a message does **not** mark read for the sender.
After mark-read succeeds, the notification list query is invalidated so the bell
badge clears.

## Composer idempotency

`clientMessageId` is generated once per draft submission and reused across retries
of that submission. A new id is created only after a successful send clears the
draft.

## Notification navigation

`conversation_detail` actions resolve to `ROUTES.messages.detail` for in-dashboard
navigation (`resolve-notification-action.ts`). Cross-app paths remain in
`crossAppConversationPath` for public/email links.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).
