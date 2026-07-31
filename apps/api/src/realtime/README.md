# Realtime (API)

Socket.IO attaches to the API HTTP server at `/api/socket.io`. Domain code emits
**after persistence** through this module only — never `io.to(...).emit` from features.

## Layout

| Path               | Responsibility                                    |
| ------------------ | ------------------------------------------------- |
| `socket-server.ts` | Handshake auth, user rooms, adapter configuration |
| `delivery.ts`      | Sole emit path (`deliverToUser` + typed helpers)  |
| `events.ts`        | Stable event names + transport payload types      |
| `auth.ts`          | `rpg_session` cookie → user lookup                |
| `rooms.ts`         | `user:{userId}` room naming                       |
| `redis-adapter.ts` | Optional `@socket.io/redis-adapter` when scaled   |
| `logging.ts`       | Auth/delivery failure logs (best-effort)          |

## Event catalog

| Event                   | When                                                   |
| ----------------------- | ------------------------------------------------------ |
| `notification.upserted` | After insert or dedupe refresh                         |
| `notification.read`     | After mark-read / mark-all / conversation-synced read  |
| `conversation.activity` | After send or mark-read (one envelope per participant) |

See [`docs/notifications.md`](../docs/notifications.md) for payload shapes, version
rules, and mark-seen exclusions.

## Multi-instance

Default: **in-memory adapter** (single API process).

Set `REDIS_URL` (for example `redis://127.0.0.1:6379`) to enable the Redis adapter
before running multiple API replicas. Sticky sessions alone are **not** sufficient for
room fanout across processes.

## Failure handling

Auth rejections and delivery exceptions are logged and never roll back domain writes.
Publish/send/mark-read HTTP handlers treat realtime as best-effort.
