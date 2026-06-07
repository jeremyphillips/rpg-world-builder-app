# Public app auth forms

How `/login` and `/signup` work, and how to extend them.

## Data flow

```text
LoginForm / SignupForm (client)
  └─ react-hook-form + zodResolver(loginInputSchema | registerInputSchema)
       └─ auth-client.ts
            ├─ GET  /api/auth/csrf      -> { csrfToken } (+ sets rpg_csrf cookie)
            └─ POST /api/auth/login     -> sets rpg_session cookie, returns { user }
               POST /api/auth/register  -> creates the account, returns { user }
```

- Validation is shared with the API: the same Zod schemas from `@rpg/contracts`
  drive both the form resolver and the server's request validation, so the
  rules cannot drift.
- Every mutating request first fetches a CSRF token and echoes it in the
  `x-csrf-token` header (double-submit). `credentials: "include"` ensures the
  session and CSRF cookies travel with the request.
- On success the form calls `onSuccess` (default: `window.location.assign("/app")`).
  Tests inject `onSuccess` to assert the redirect without a real navigation.

## Error handling

`auth-client` throws an `ApiError` carrying the server's `status`, `code`, and
`message` (from the shared `{ error: { code, message } }` shape). Forms catch it
and render a form-level `role="alert"`. Field-level issues are shown inline from
react-hook-form's `formState.errors`.

## Adding another auth-related screen

1. Add the component under `src/features/auth/components/` with `"use client"`.
2. Reuse `@rpg/contracts` schemas; add new API calls to `api/auth-client.ts`.
3. Export the public pieces from `src/features/auth/index.ts`.
4. Add a route under `src/app/<route>/page.tsx` that renders it.
5. Add an RTL test asserting validation and the success path (mock `auth-client`).
