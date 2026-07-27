# Admin users API

Platform-admin endpoints for listing users, previewing delete dependencies, and
hard-deleting disposable test accounts.

## Access

| Endpoint                                        | Roles                 |
| ----------------------------------------------- | --------------------- |
| `GET /api/admin/users`                          | `admin`, `superadmin` |
| `GET /api/admin/users/:userId`                  | `admin`, `superadmin` |
| `GET /api/admin/users/:userId/campaigns`        | `admin`, `superadmin` |
| `GET /api/admin/users/:userId/characters`       | `admin`, `superadmin` |
| `GET /api/admin/users/:userId/deletion-preview` | `superadmin`          |
| `DELETE /api/admin/users/:userId`               | `superadmin`          |

## Activity semantics

`lastActiveAt` reflects **meaningful server-observed use**, not every browser
interaction. Plain page navigation that only hits cached client data may not
produce API traffic — that is expected.

### Write paths

- **Login** sets both `lastSignedInAt` and `lastActiveAt`.
- **Authenticated domain requests** may update `lastActiveAt` via throttled
  middleware (`USER_ACTIVITY_WRITE_INTERVAL_MINUTES`).

### Excluded paths

Activity is **not** recorded for:

- `/api/auth/*`
- `/api/health`
- `/api/bench/*` (dev-bench)

## Deletion policy

Admin deletion is a **hard delete** for disposable/test accounts. It is **not**
a GDPR-style anonymization workflow.

### Blockers (recomputed on every `DELETE`)

| Blocker             | Rule                                                  |
| ------------------- | ----------------------------------------------------- |
| `insufficient_role` | Actor is not `superadmin`                             |
| `self`              | Target id === actor id                                |
| `last_superadmin`   | Target is `superadmin` and no other superadmins exist |
| `owns_campaigns`    | Target has ≥1 `owner` membership                      |

Preview responses are advisory; `DELETE` always recomputes blockers.

### Cascade

When not blocked:

1. Delete each PC via `deleteCharacterForUser` (canonical character delete).
2. Remove `co-owner`, `pc`, and `observer` memberships.
3. Delete `pending` invites for the user's normalized email and `accepted`
   incomplete invites where `acceptedByUserId` matches.
4. Delete the user document.

Owned campaigns are never silently cascaded.

## Invite cascade

| Invite state                               | Action                      |
| ------------------------------------------ | --------------------------- |
| `pending` (normalized email match)         | Delete                      |
| `accepted` incomplete (`acceptedByUserId`) | Delete                      |
| `completed`                                | Retain as historical record |

## Campaign count buckets

| Bucket  | `campaignRole`   |
| ------- | ---------------- |
| owned   | `owner`          |
| coOwned | `co-owner`       |
| joined  | `pc`, `observer` |

List rows and deletion-preview dependencies share `admin-user-summary.service.ts`.

## Drill-down routes (read-only)

Dashboard routes under `/admin/users/:userId` are read-only drill-down surfaces:
overview, campaigns table, and characters card list. They reuse shared delete
semantics and do not introduce user editing or membership management.
