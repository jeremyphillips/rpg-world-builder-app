# notification (dashboard feature)

In-app notifications surfaced in the topbar bell menu and `/notifications` inbox.
TanStack Query polling plus Socket.IO cache patches keep data fresh; polling remains
a fallback while connected.

API publish/list contracts (including list filters) live in
[`apps/api/docs/notifications.md`](../../../../api/docs/notifications.md).

## Layout

| Path                                              | Responsibility                                                |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `api/notifications.ts`                            | Same-origin notification API client                           |
| `hooks/use-notifications.ts`                      | Bell list query (`unreadCount` included)                      |
| `hooks/use-notification-inbox.ts`                 | Infinite inbox query (filter-keyed cache)                     |
| `hooks/use-notification-inbox-page.ts`            | Inbox page state: filters, mark-all, load more                |
| `hooks/use-notification-actions.ts`               | Mark read / all read / seen mutations                         |
| `hooks/use-notification-bell-menu.ts`             | Bell open/seen + mark-all wiring                              |
| `components/notification-bell-menu.tsx`           | Wires `@rpg/ui` primitives + navigation                       |
| `components/notification-inbox-header.client.tsx` | Description + `PrimaryFilterPanel` (Unread / Campaign / Type) |
| `components/notification-inbox-body.client.tsx`   | Preview list + load more                                      |
| `routes/notifications-list.tsx`                   | Paginated notification history                                |
| `lib/notification-inbox-filter-schema.ts`         | Inbox `FilterSchema` (URL-synced server filters)              |
| `lib/notification-query-keys.ts`                  | Bell + inbox query keys                                       |
| `lib/notification-cache.ts`                       | Bell cache helpers + version guards                           |
| `lib/resolve-notification-action.ts`              | Maps persisted action kinds to app paths                      |
| `lib/notification-copy.ts`                        | User-facing copy                                              |

Presentation primitives (`NotificationBell`, popover, preview list/item, empty/loading)
live in `@rpg/ui` and stay domain-agnostic. Rows are whole-row click targets — no
separate Open action. Unread rows use selected-row chrome; read rows use hover
surface tokens.

## Bell footer

The bell footer always exposes **View all notifications** in a dedicated muted
footer row. When the current URL includes a campaign route param
(`/campaigns/:campaignId/...`), a contextual **View messages for this campaign**
menu row (with message icon) appears above that footer. Global message shortcuts
are intentionally omitted — sidebar nav owns `/messages`.

Row click marks read (fire-and-forget) and navigates when the notification action
resolves to a path (`conversation_detail`, `campaign_detail`, etc.).

## Inbox page (`/notifications`)

Uses the same compact preview list as the bell (wider column, bordered list,
subtle dividers). Page header holds title + **Mark all as read**; description and a
`PrimaryFilterPanel` (Unread only, Campaign, Type) drive URL-synced **server**
filters via `GET /api/notifications` (`unread`, `category`, `campaignId`). Optional
active chips summarize modified filters. Type options use existing notification
category vocab (`campaign` | `message`) — no dashboard-local option copy. Empty
filtered state: **You're all caught up.** Pagination uses **Load more**.

Do **not** client-filter cursor pages — incomplete loaded sets produce misleading
empties.

Invalid `campaignId` uses the shared `useInvalidCampaignScopeNotice` /
`INVALID_CAMPAIGN_SCOPE_COPY` path (same quiet notice as Messages). The inbox reads
the raw `?campaignId=` search param (not only hydrated filter values) and defers
scoped fetches until campaign options have settled.

Direct-message notifications persist `payload.campaignIds` (recipient-visible shared
campaigns at publish time). Inbox `?campaignId=` matches when that id is in
`payload.campaignIds`. Activating a row under a scoped inbox preserves the page
filter's `campaignId` on conversation navigation; the global bell omits it.

### Global vs filtered

- List **`unreadCount`** in responses is always **recipient-global** — it ignores
  active inbox filters.
- **Mark all as read** marks every unread notification for the recipient — it is
  not scoped to the current Unread / Campaign / Type filters.

## Polling rules

- Query runs only when a session user exists.
- `refetchInterval` stays enabled while `document.visibilityState === 'visible'`.
- Fast poll (30s) while the realtime socket is disconnected or handshaking; slow poll
  (90s) while connected.
- `refetchOnWindowFocus: true` recovers after backgrounding.
- Do **not** add a second unread-count poll — the list response already includes it.

## Bell vs inbox

| Surface                | Query key                             | Shape                 |
| ---------------------- | ------------------------------------- | --------------------- |
| Bell popover           | `notificationsListQueryKey(10)`       | Finite first page     |
| `/notifications` inbox | `notificationsInboxQueryKey(filters)` | Infinite cursor pages |

Socket upserts patch the bell directly; the inbox is invalidated when mounted.
Mutations patch the bell and invalidate the inbox when cached.

## Mark-seen contract

When the popover opens, call mark-seen with only the notification IDs currently
rendered in the list (not the full cursor page beyond the UI cap). Failed mark-seen
requests retry on the next effect pass; closing the popover clears the tracked IDs.

## Deferred gaps

| Gap                             | Status                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `archivedAt` / archive controls | Field is stored and filtered from queries; no archive endpoint or pruning job yet. |

Shipped (not deferred): `message.direct.received` producer; inbox cursor pagination +
Load more; list filters (`unread` / `category` / `campaignId`).

## Adding a notification type

1. Add the type, payload schema, and DTO union arm in `@rpg/contracts`.
2. Extend the API registry (`formatPreview` + `resolveAction`).
3. Publish from the domain feature via `publishNotification` after the domain write
   commits (best-effort).
4. If the type needs navigation, add a contracts action kind and map it in
   `resolve-notification-action.ts`.
5. If it needs a new high-level Type filter bucket, extend
   `NOTIFICATION_CATEGORIES` / entries and classification — do not invent dashboard-only
   category labels.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).
