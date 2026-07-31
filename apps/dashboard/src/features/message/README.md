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

| Route                       | Shell behavior                                                                |
| --------------------------- | ----------------------------------------------------------------------------- |
| `/messages`                 | PageHeader + list; empty list shows mobile-only Start a conversation fallback |
| `/messages/new`             | PageHeader Cancel + recipient picker; scope chip hidden on mobile             |
| `/messages/new?from=:id`    | Desktop: recipient picker + read-only preview thread; mobile: picker only     |
| `/messages/new?to=:userId`  | Draft thread; header Cancel on mobile                                         |
| `/messages/:conversationId` | Thread; mobile shows thread only with back link to scoped or global list      |

The workspace owns one page-level **New message** action in the PageHeader. Pane-level
links are reserved for contextual recovery (mobile empty-list fallback), not duplicated
primary creation paths.

`md+` uses a fixed two-column grid. Mobile shows one pane at a time via route
state in `resolve-messages-workspace-route-state.lib.ts`. Back links derive their
target from the current URL's `campaignId`, not browser history.

### Preview thread (`threadMode`)

`MessagesThreadPane` accepts `threadMode: 'active' | 'preview'` (default
`'active'`). `resolveMessagesThreadModeBehavior` is the single source of truth for
composer visibility, mark-read eligibility, and preview chrome.

- **Active:** composer shown; mark-read runs when eligible.
- **Preview:** composer hidden; mark-read disabled; preview eyebrow copy above the
  thread header on desktop. History remains interactive — scroll, text selection, and
  inline shared-campaign links work normally (no `pointer-events-none`).
- **Mobile `/messages/new?from=`:** picker only; `from` is the Cancel/back target, not
  a visible preview pane (`showRightOnMobile` stays false).

Cancel on the new-message route uses `resolveMessagesNewCancelTarget` — when `from`
is present, navigation returns to that conversation with `campaignId` preserved.

### Thread header shared campaigns

Peer name is the primary heading. Shared campaigns render via `CampaignDisplayNameList`
(`surface="inlineMuted"`) — one campaign icon with comma-separated linked names built
from `buildMessageThreadSharedCampaignDisplay`.

Draft threads derive shared campaigns via `resolveRecipientSharedCampaigns` from the
recipients response — do not filter `data.campaigns` ad hoc in pane components.

### Thread group timestamps

Message groups use semantic list markup (`ul > li` per segment/group; bubbles as
`<div>` children). Each group shows exactly one `MessagesMetadataTime` under the
final bubble; date separators render one `<time>` each. `group.timestamp` is the
final message in the group.

### Conversation list inset

The direct list pane is edge-to-edge. Loading, error, empty, scope hint, and
out-of-scope pin chrome use deliberate horizontal inset (`px-3`); conversation rows
keep edge-to-edge backgrounds via row CVA padding.

## Layout

| Path                                                      | Responsibility                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `routes/messages-workspace.tsx`                           | Unified workspace shell export                                            |
| `components/messages-workspace-shell.client.tsx`          | PageHeader, scope chrome, pane orchestration                              |
| `components/messages-workspace-header.client.tsx`         | Messages H1 + primary New message / recipient Cancel                      |
| `components/messages-workspace-panes.client.tsx`          | List, thread, and recipient picker panes                                  |
| `components/messages-campaign-scope.client.tsx`           | Scope chip, utility, invalid notice, out-of-scope pin                     |
| `components/messages-entry-links.client.tsx`              | Campaign/global entry links for nav and overview                          |
| `api/conversations.ts`                                    | Same-origin conversation API client                                       |
| `hooks/use-conversations.ts`                              | Conversation list query with poll-while-visible                           |
| `hooks/use-conversation-messages.ts`                      | Infinite message pages for a thread                                       |
| `hooks/use-conversation-recipients.ts`                    | Active campaign-member picker data                                        |
| `hooks/use-conversation-actions.ts`                       | First send, send, mark-read mutations                                     |
| `hooks/use-messages-campaign-scope-effects.ts`            | Invalid scope strip + notice                                              |
| `lib/messages-copy.ts`                                    | User-facing copy constants and formatters                                 |
| `lib/messages-campaign-scope-navigation.lib.ts`           | Clear scope + invalid-scope redirect paths                                |
| `lib/conversation-query-keys.ts`                          | Shared query keys                                                         |
| `lib/conversation-cache.ts`                               | List/thread cache helpers + version guards                                |
| `lib/sort-messages-chronologically.ts`                    | Newest-first API pages → chronological render                             |
| `lib/group-messages-by-time.lib.ts`                       | Consecutive same-sender groups within five minutes and the same local day |
| `lib/build-message-thread-segments.lib.ts`                | Ordered date separators + message groups for thread render                |
| `lib/messages-thread-mode.lib.ts`                         | `threadMode` behavior resolver (composer, mark-read, preview chrome)      |
| `lib/resolve-recipient-shared-campaigns.lib.ts`           | Draft-thread shared campaign derivation from recipients response          |
| `lib/message-thread-shared-campaigns-presentation.lib.ts` | Inline vs overflow shared campaign presentation rules                     |

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

## Conversation list unread indicator

- `unreadCount === 1` → `StatusDot` (`info`) only
- `unreadCount >= 2` → count badge only
- Never dot and badge together; unread title weight lives on the peer name, not the row CVA

## Mark-read contract

Selection alone does **not** mark a conversation read. Active threads pass
`isAttentionEligible` from `resolveMessagesThreadModeBehavior('active')` into
`useMessageThreadMarkRead`:

- Canonical active thread route with a visible pane (preview threads and CSS-hidden
  mobile panes are ineligible via `threadMode: 'preview'`)
- Thread load success (not pending/error)
- Latest rendered message is an **incoming** unread message (`senderUserId !== viewer`)
- Initial explicit open: `document.visibilityState === 'visible'` is sufficient
- New inbound while already open: requires visible **and** focused document

Sending a message does **not** mark read for the sender. After mark-read succeeds,
the notification list query is invalidated so the bell badge clears.

## First message (lazy create)

Selecting a recipient navigates immediately — there is no separate Start/Continue
action and no API call until the user sends from the draft thread.

- New peer without an active thread → `/messages/new?to=:userId` (optional
  `campaignId`, `from` preview preserved).
- Existing active thread → `/messages/:conversationId`.
- First send calls `POST /api/conversations/direct/messages` (transactional
  find-or-create + message insert). Success replaces the URL to
  `/messages/:conversationId` so Back does not return to the sent draft.
- Deep links to `?to=` resolve the peer via an independent recipients fetch;
  stale or ineligible `to` values show recovery copy with a link back to the
  picker.

## Composer idempotency

`clientMessageId` is generated once per draft submission and reused across retries
of that submission. A new id is created only after a successful send clears the
draft.

## Notification navigation

`conversation_detail` actions resolve to `ROUTES.messages.detail` for in-dashboard
navigation (`resolve-notification-action.ts`). An optional `campaignId` on the
action preserves active scope when known. Cross-app paths remain in
`crossAppConversationPath` for public/email links.

Bell **footer/chrome** may surface a campaign-scoped message link when the viewer
is on a campaign route (`/campaigns/:campaignId/...`). Global message shortcuts are
not duplicated in the bell — sidebar nav owns `/messages`. Per-notification rows
do not duplicate those actions.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).
