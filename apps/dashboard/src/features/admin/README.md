# admin (dashboard feature)

Platform administration for elevated roles (`admin`, `superadmin`): user
management and global settings. Route access is gated by `AdminRouteGuard`;
the sidebar section is hidden for non-elevated users.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).

## Key files

| Area        | Path                               |
| ----------- | ---------------------------------- |
| Route guard | `components/admin-route-guard.tsx` |
| Users route | `routes/admin-users.tsx`           |
| Settings    | `routes/admin-settings.tsx`        |

## Related docs

- [feature-structure.md](../../docs/feature-structure.md)
- [routing.md](../../../../docs/routing.md)
