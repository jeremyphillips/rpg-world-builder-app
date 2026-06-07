# Auth guard & session

The dashboard is an authenticated-only SPA. It never renders login/signup forms
— those live on the public app. Instead it gates everything behind a session
check and redirects unauthenticated visitors back to the public `/login`.

## Flow

```mermaid
sequenceDiagram
  participant U as User
  participant D as Dashboard (/app)
  participant A as API (/api)
  participant P as Public (/login)

  U->>D: open /app
  D->>A: GET /api/auth/me (cookie auto-sent, credentials: include)
  alt session valid (200)
    A-->>D: { user: SessionUser }
    D-->>U: render app shell + routes
  else unauthenticated (401)
    A-->>D: 401
    D->>P: window.location.assign("/login")
  end
```

## Pieces

- **`api/auth-client.ts`** — same-origin fetch wrappers:
  - `fetchSession()` → `GET /api/auth/me`, returns `SessionUser` or throws
    `ApiError` (401 when unauthenticated).
  - `logout()` → fetches a CSRF token from `GET /api/auth/csrf`, then
    `POST /api/auth/logout` with the `x-csrf-token` header.
  - `LOGIN_PATH = "/login"` — the same-origin public login route.
- **`hooks/use-session.ts`** — `useSession()` wraps `fetchSession` in a
  TanStack Query (`["auth", "session"]`, `retry: false`) so a 401 surfaces
  immediately instead of being retried.
- **`hooks/use-logout.ts`** — `useLogout()` mutation; on success redirects to
  `LOGIN_PATH`.
- **`components/auth-guard.tsx`** — layout route element. Loading → spinner
  text; error → redirect to `/login`; success → `<Outlet />`.

## Why a hard redirect (not a React Router navigation)

`/login` is owned by the **public** app, a different SPA/origin path served by
the proxy. React Router only controls routes under the dashboard's `/app`
basename, so leaving the dashboard requires a real browser navigation
(`window.location.assign`). The same applies to logout.

## CSRF

State-changing requests (logout) use the double-submit pattern shared with the
public app: fetch a token from `GET /api/auth/csrf` (which also sets the
readable `rpg_csrf` cookie) and echo it in the `x-csrf-token` header. `GET`
requests like `/auth/me` are safe methods and need no token.
