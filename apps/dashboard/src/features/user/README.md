# user (dashboard feature)

Signed-in user account settings in the DM workspace: display name, avatar, and
password change. Distinct from `auth` (session gate) and the API user domain.

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).

## Key files

| Area          | Path                                     |
| ------------- | ---------------------------------------- |
| Account route | `routes/account-settings.tsx`            |
| Profile form  | `components/profile-section.tsx`         |
| Password form | `components/change-password-section.tsx` |
| API client    | `api/user-client.ts`                     |

## Related docs

- [feature-structure.md](../../docs/feature-structure.md)
- [routing.md](../../../../docs/routing.md)
