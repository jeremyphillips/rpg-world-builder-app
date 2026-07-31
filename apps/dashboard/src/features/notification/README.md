# notification (dashboard feature)

In-app notifications surfaced in the topbar bell menu and `/notifications` inbox.
TanStack Query polling plus Socket.IO cache patches keep data fresh; polling remains
a fallback while connected.

## Layout

| Path                                    | Responsibility                              |
| --------------------------------------- | ------------------------------------------- |
| `api/notifications.ts`                  | Same-origin notification API client         |
| `hooks/use-notifications.ts`            | Bell list query (`unreadCount` included)    |
| `hooks/use-notification-inbox.ts`       | Infinite inbox query (separate cache shape) |
| `hooks/use-notification-actions.ts`     | Mark read / all read / seen mutations       |
| `components/notification-bell-menu.tsx` | Wires `@rpg/ui` primitives + navigation     |
| `routes/notifications-list.tsx`         | Paginated notification history              |
| `lib/notification-query-keys.ts`        | Bell + inbox query keys                     |
| `lib/notification-cache.ts`             | Bell cache helpers + version guards         |
| `lib/resolve-notification-action.ts`    | Maps persisted action kinds to app paths    |

Presentation primitives (`NotificationBell`, popover, preview list/item, empty/loading)
live in `@rpg/ui` and stay domain-agnostic.

## Polling rules

- Query runs only when a session user exists.
- `refetchInterval` stays enabled while `document.visibilityState === 'visible'`.
- Fast poll (30s) while the realtime socket is disconnected or handshaking; slow poll
  (90s) while connected.
- `refetchOnWindowFocus: true` recovers after backgrounding.
- Do **not** add a second unread-count poll — the list response already includes it.

## Bell vs inbox

| Surface                | Query key                       | Shape                 |
| ---------------------- | ------------------------------- | --------------------- |
| Bell popover           | `notificationsListQueryKey(10)` | Finite first page     |
| `/notifications` inbox | `notificationsInboxQueryKey`    | Infinite cursor pages |

Socket upserts patch the bell directly; the inbox is invalidated when mounted.
Mutations patch the bell and invalidate the inbox when cached.

## Mark-seen contract

When the popover opens, call mark-seen with only the notification IDs currently
rendered in the list (not the full cursor page beyond the UI cap). Failed mark-seen
requests retry on the next effect pass; closing the popover clears the tracked IDs.

## Deferred gaps

| Gap                                | Status                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `message.direct.received` producer | Published on direct message send; conversation mark-read clears the deduped row.   |
| `archivedAt` / archive controls    | Field is stored and filtered from queries; no archive endpoint or pruning job yet. |

## Adding a notification type

1. Add the type, payload schema, and DTO union arm in `@rpg/contracts`.
2. Extend the API registry (`formatPreview` + `resolveAction`).
3. Publish from the domain feature via `publishNotification` after the domain write
   commits (best-effort).
4. If the type needs navigation, add a contracts action kind and map it in
   `resolve-notification-action.ts`.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).
