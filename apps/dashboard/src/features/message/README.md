# message (dashboard feature)

Direct one-to-one conversations with campaign-member recipient discovery. Phase 1
uses TanStack Query polling; Socket.IO can update the same caches later.

## Layout

| Path                                   | Responsibility                                  |
| -------------------------------------- | ----------------------------------------------- |
| `api/conversations.ts`                 | Same-origin conversation API client             |
| `hooks/use-conversations.ts`           | Conversation list query with poll-while-visible |
| `hooks/use-conversation-messages.ts`   | Infinite message pages for a thread             |
| `hooks/use-conversation-recipients.ts` | Active campaign-member picker data              |
| `hooks/use-conversation-actions.ts`    | Create, send, mark-read mutations               |
| `lib/conversation-query-keys.ts`       | Shared query keys                               |
| `lib/sort-messages-chronologically.ts` | Newest-first API pages → chronological render   |
| `routes/messages-list.tsx`             | Conversation index                              |
| `routes/new-message.tsx`               | Recipient picker + create/find                  |
| `routes/message-thread.tsx`            | Thread view, composer, mark-read while open     |

## Polling rules

- List and thread queries run only when a session user exists.
- `refetchInterval` is active while `document.visibilityState === 'visible'`.
- `refetchOnWindowFocus: true` recovers after backgrounding.

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

`conversation_detail` actions resolve through `crossAppConversationPath` in
`resolve-notification-action.ts`.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).
