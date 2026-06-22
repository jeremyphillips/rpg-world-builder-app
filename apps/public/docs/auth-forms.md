# Public app auth forms

How `/login` and `/signup` work, session checks, and how to extend them.

## Data flow

```text
LoginForm / SignupForm (client)
  └─ react-hook-form + zodResolver(loginInputSchema | registerInputSchema)
       └─ auth-client.ts (@rpg/api-client)
            ├─ GET  /api/auth/csrf      -> { csrfToken } (+ sets rpg_csrf cookie)
            ├─ GET  /api/auth/me        -> { user, activeCampaign } (session check)
            ├─ POST /api/auth/login     -> sets rpg_session cookie, returns { user }
            └─ POST /api/auth/register  -> creates the account, returns { user }
```

- Validation is shared with the API: the same Zod schemas from `@rpg/contracts`
  drive both the form resolver and the server's request validation, so the
  rules cannot drift.
- Every mutating request first fetches a CSRF token and echoes it in the
  `x-csrf-token` header (double-submit). `credentials: "include"` ensures the
  session and CSRF cookies travel with the request.
- On success the form calls `onSuccess` (default:
  `window.location.assign(CROSS_APP_PATHS.dashboard)`). Tests inject
  `onSuccess` to assert the redirect without a real navigation.

## Session check & authenticated redirect

The public app uses TanStack Query (`AppProviders` in `layout.tsx`) and
`useSession()` (`GET /api/auth/me`) to reflect auth state in the header and on
auth pages.

**`GET /api/auth/me` response** (`AuthMeResponse` from `@rpg/contracts`):

```ts
{
  user: SessionUser
  activeCampaign: { id: string; name: string } | null
}
```

- **`SiteHeaderNav`** — while the session query is pending, shows a neutral
  pulse skeleton; when unauthenticated, login/signup links; when authenticated,
  an avatar dropdown (Dashboard, Profile, Account Settings, Sign out).
- **`AuthRedirect`** — wraps login/signup form content. While pending (or when
  already authenticated), shows the same skeleton; when `data.user` is present,
  assigns `CROSS_APP_PATHS.dashboard` so signed-in users cannot stay on
  `/login` or `/signup`.

Cross-app paths (`/app/`, `/login`, etc.) come from `CROSS_APP_PATHS` in
`@rpg/contracts` — do not hardcode them in the public app.

## Error handling

`@rpg/api-client` throws an `ApiError` carrying the server's `status`, `code`, and
`message` (from the shared `{ error: { code, message } }` shape). Forms catch it
and render a form-level `role="alert"`. Field-level issues are shown inline from
react-hook-form's `formState.errors`.

## Adding another auth-related screen

1. Add the component under `src/features/auth/components/` with `"use client"`.
2. Reuse `@rpg/contracts` schemas; add new API calls to `api/auth-client.ts`
   (prefer `@rpg/api-client` helpers for fetch/CSRF).
3. Export the public pieces from `src/features/auth/index.ts`.
4. Add a route under `src/app/<route>/page.tsx` that renders it.
5. Wrap with `AuthRedirect` when the page should be guest-only.
6. Add an RTL test asserting validation and the success path (mock `auth-client`).
