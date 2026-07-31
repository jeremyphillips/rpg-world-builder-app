# notification (dashboard feature)

In-app notifications surfaced in the topbar bell menu. Phase 1 uses TanStack Query
polling; Socket.IO can update the same cache later without changing feature wiring.

## Layout

| Path                                    | Responsibility                                  |
| --------------------------------------- | ----------------------------------------------- |
| `api/notifications.ts`                  | Same-origin notification API client             |
| `hooks/use-notifications.ts`            | Single list query (`unreadCount` included)      |
| `hooks/use-notification-actions.ts`     | Mark read / all read / seen mutations           |
| `components/notification-bell-menu.tsx` | Wires `@rpg/ui` primitives + navigation         |
| `lib/notification-query-keys.ts`        | Query keys shared with future realtime provider |
| `lib/resolve-notification-action.ts`    | Maps persisted action kinds to app paths        |

Presentation primitives (`NotificationBell`, popover, preview list/item, empty/loading)
live in `@rpg/ui` and stay domain-agnostic.

## Polling rules

- Query runs only when a session user exists.
- `refetchInterval` is active while `document.visibilityState === 'visible'`.
- `refetchOnWindowFocus: true` recovers after backgrounding.
- Do **not** add a second unread-count poll — the list response already includes it.

## Mark-seen contract

When the popover opens, call mark-seen with only the notification IDs currently
rendered in the list (not the full cursor page beyond the UI cap). Failed mark-seen
requests retry on the next effect pass; closing the popover clears the tracked IDs.

## Phase 1 deferred gaps

| Gap                                | Status                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `nextCursor` pagination            | API returns cursors; dashboard fetches only the first page (limit 10). No load-more UI yet. |
| `message.direct.received` producer | Contracts + registry exist; no domain producer until DM persistence lands.                  |
| `archivedAt` / archive controls    | Field is stored and filtered from queries; no archive endpoint or pruning job yet.          |

## Adding a notification type

1. Add the type, payload schema, and DTO union arm in `@rpg/contracts`.
2. Extend the API registry (`formatPreview` + `resolveAction`).
3. Publish from the domain feature via `publishNotification` after the domain write
   commits (best-effort).
4. If the type needs navigation, add a contracts action kind and map it in
   `resolve-notification-action.ts`.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).
