# @rpg/api-client

Same-origin HTTP helpers shared by the public and dashboard apps. Depends only on
`@rpg/contracts` — no React or TanStack Query.

## Exports

- `request`, `postJson`, `putJson`, `patchJson` — fetch with CSRF on mutating methods
- `fetchSession()` — `GET /api/auth/me` → `AuthMeResponse`
- `logout()` — CSRF + `POST /api/auth/logout`
- `CSRF_HEADER`, `ApiError` (re-exported from contracts where applicable)

Apps wrap these in TanStack Query hooks (`useSession`, `useLogout`) locally.
