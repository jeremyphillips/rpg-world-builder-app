# message (dashboard feature)

Direct one-to-one conversations with campaign-member recipient discovery. TanStack
Query polling plus Socket.IO cache patches keep list and active thread fresh.

## Ownership vs campaign context

Direct messaging is **globally owned** by the user workspace — not by a campaign.
Optional `campaignId` on `/messages` URLs narrows discovery and presentation only;
it never changes conversation identity, authz, or routes under `/campaigns/...`.

A direct thread may relate to many shared campaigns; the UI never assigns a primary
owner campaign. Participant checks remain independent of the active `campaignId`
filter.

Campaign-owned channels (`kind: 'campaign'`) and a Direct | Campaigns mode switch
are reserved for a future phase when the API can create and return campaign
conversations. Until then, legacy `?mode=campaigns` URLs redirect to the unscoped
workspace.

## Campaign discovery scope

### Eligibility

A conversation or recipient is **in scope** for `campaignId=X` when the peer would
be returned by recipient discovery for campaign X. The API reuses
[`isEligibleDirectMessagePeerInSharedCampaign`](../../../../api/src/features/conversation/direct-message-peer-eligibility.lib.ts)
and the same membership context loading as
[`listDirectMessageRecipients`](../../../../api/src/features/conversation/direct-message-recipients.service.ts).

Do not invent a second client-side definition.

### Full-dataset counts

When `campaignId` is active, list responses include full-dataset metadata:

- `totalCount` — all of the viewer's direct conversations
- `scopedCount` — conversations matching campaign eligibility
- `hiddenCount` — `totalCount - scopedCount`

The scope utility and chip copy use these API counts, not the loaded page length.
When pagination is active, a separate loaded-only hint appears when
`items.length < scopedCount`.

### Invalid scope

When `campaignId` is invalid or inaccessible, the API sets `scopeInvalid`. The
client strips the query param, shows the quiet notice (`This campaign filter is no
longer available.` / `Showing all messages instead.`), and loads the unscoped list
or thread.

### Clear-on-thread

Clearing scope from an open conversation navigates to `/messages/:conversationId`
(dropping only `campaignId`). Clearing scope from list or new routes drops the
query and stays on list/new.

## Responsive workspace

Routes mount a single workspace shell:

| Route                       | Shell behavior                                                                  |
| --------------------------- | ------------------------------------------------------------------------------- |
| `/messages`                 | List + desktop empty right pane                                                 |
| `/messages/new`             | Recipient picker; mobile is full-screen (scope chrome and header action hidden) |
| `/messages/:conversationId` | Thread; mobile shows thread only with back link to scoped or global list        |

`md+` uses a fixed two-column grid. Mobile shows one pane at a time via route
state in `resolve-messages-workspace-route-state.lib.ts`. Back links derive their
target from the current URL's `campaignId`, not browser history.

## Layout

| Path                                             | Responsibility                                        |
| ------------------------------------------------ | ----------------------------------------------------- |
| `routes/messages-workspace.tsx`                  | Unified workspace shell export                        |
| `components/messages-workspace-shell.client.tsx` | Header, scope chrome, pane orchestration              |
| `components/messages-workspace-panes.client.tsx` | List, thread, and recipient picker panes              |
| `components/messages-campaign-scope.client.tsx`  | Scope chip, utility, invalid notice, out-of-scope pin |
| `components/messages-entry-links.client.tsx`     | Campaign/global entry links for nav and overview      |
| `api/conversations.ts`                           | Same-origin conversation API client                   |
| `hooks/use-conversations.ts`                     | Conversation list query with poll-while-visible       |
| `hooks/use-conversation-messages.ts`             | Infinite message pages for a thread                   |
| `hooks/use-conversation-recipients.ts`           | Active campaign-member picker data                    |
| `hooks/use-conversation-actions.ts`              | Create, send, mark-read mutations                     |
| `hooks/use-messages-campaign-scope-effects.ts`   | Invalid scope strip + notice                          |
| `lib/messages-copy.ts`                           | User-facing copy constants and formatters             |
| `lib/messages-campaign-scope-navigation.lib.ts`  | Clear scope + invalid-scope redirect paths            |
| `lib/conversation-query-keys.ts`                 | Shared query keys                                     |
| `lib/conversation-cache.ts`                      | List/thread cache helpers + version guards            |
| `lib/sort-messages-chronologically.ts`           | Newest-first API pages → chronological render         |
| `lib/group-messages-by-time.lib.ts`              | Five-minute consecutive message groups                |

## Polling rules

- List and thread queries run only when a session user exists.
- `refetchInterval` is active while `document.visibilityState === 'visible'`.
- Fast poll while disconnected; slow poll (90s list / 60s thread) while socket-connected.
- `refetchOnWindowFocus: true` recovers after backgrounding.

## Conversation list pagination (deferred)

The API returns `nextCursor` for conversation lists and the client accepts a
`cursor` parameter, but the workspace only fetches the first page (`limit: 20`) in
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
navigation (`resolve-notification-action.ts`). An optional `campaignId` on the
action preserves active scope when known. Cross-app paths remain in
`crossAppConversationPath` for public/email links.

Bell **footer/chrome** surfaces campaign/global message entry links
(`MessagesCampaignEntryLinks`, `MessagesGlobalEntryLink`). Per-notification rows
do not duplicate those actions.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).
