# realtime (dashboard feature)

Socket.IO client wiring for authenticated dashboard sessions. Phase 2 handles
notification bell cache updates only; conversation envelopes arrive in Phase 3.

## Layout

| Path                                      | Responsibility                                             |
| ----------------------------------------- | ---------------------------------------------------------- |
| `components/realtime-provider.client.tsx` | Connects after auth, dispatches notification socket events |
| `context/realtime-context.tsx`            | Exposes `isConnected` for slow poll fallback               |
| `lib/realtime-events.ts`                  | Event names + socket path (must match API)                 |

## Rules

- Mount under `AuthGuard` only — disconnect when the session user changes.
- Notification handlers patch the bell first-page query via `@/features/notification`
  cache helpers; do not touch future inbox infinite-query caches.
- Reconnect invalidates `notificationsQueryKey` (first page scope only).
- Polling stays enabled: fast interval while disconnected, slow interval while connected.
