# realtime (dashboard feature)

Socket.IO client wiring for authenticated dashboard sessions. Notification and
conversation socket events patch feature-local TanStack Query caches; polling
remains a slow fallback while connected.

## Layout

| Path                                      | Responsibility                                              |
| ----------------------------------------- | ----------------------------------------------------------- |
| `components/realtime-provider.client.tsx` | Connects after auth, dispatches socket events to features   |
| `context/realtime-context.tsx`            | Exposes `isConnected` + active thread id for scoped refetch |
| `lib/realtime-events.ts`                  | Event names + socket path (must match API)                  |

## Rules

- Mount under `AuthGuard` only — disconnect when the session user changes.
- Notification handlers patch the bell first-page query via `@/features/notification`
  cache helpers; inbox infinite-query caches are invalidated when mounted.
- Conversation handlers patch list + active thread caches via `@/features/message`
  helpers; do not mark read from socket alone.
- Reconnect invalidates bell first page, conversation list, active thread, and
  mounted inbox — not every cached historical page.
- Polling stays enabled: fast interval while disconnected, slow interval while connected.
