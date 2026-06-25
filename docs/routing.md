# Routing conventions

Cross-cutting guide for managing in-app navigation paths. See
[architecture.md](./architecture.md) for the overall single-origin topology.

## Source of truth

Each app owns a `ROUTES` constant that is the **only** place route paths are
written as raw strings. All navigation code imports from it.

| App              | File                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| `@rpg/dashboard` | [`apps/dashboard/src/app/routes.ts`](../apps/dashboard/src/app/routes.ts) |
| `@rpg/public`    | [`apps/public/src/lib/routes.ts`](../apps/public/src/lib/routes.ts)       |

## Shape rules

**Static path → plain string**

```ts
profile: '/profile',
```

**Parameterized path → function returning string**

```ts
campaign: {
  detail:   (id: string) => `/campaigns/${id}`,
  sessions: (id: string) => `/campaigns/${id}/sessions`,
},
```

This keeps the call site type-safe: forgetting a required `id` argument is a
compile error, not a runtime bug.

**Landing + detail pairs** follow the same rule. Add the landing route as a
plain string and the detail route as a function:

```ts
location: {
  list:   '/locations',
  detail: (id: string) => `/locations/${id}`,
},
```

## Route declarations vs. navigation

`router.tsx` `<Route path="...">` declarations use raw relative strings. They are
already the single declaration point for the React Router tree and do not need to
import `ROUTES`. `ROUTES` handles the _navigation_ side (links, `navigate()`
calls, programmatic builders).

On the dashboard, route **components** (not path strings) lazy-load via
[`lazy-routes.ts`](../apps/dashboard/src/app/lazy-routes.ts). See
[apps/dashboard/docs/code-splitting.md](../apps/dashboard/docs/code-splitting.md).

## Cross-app paths

`LOGIN_PATH` (dashboard → public `/login`) and `DASHBOARD_PATH` (public → dashboard
`/app/`) are cross-app redirect targets, not same-app navigation. They stay in
their respective auth clients:

- Dashboard: `apps/dashboard/src/features/auth/api/auth-client.ts`
- Public: `apps/public/src/features/auth/api/auth-client.ts`

> The trailing slash on `DASHBOARD_PATH = '/app/'` is load-bearing — omitting it
> hits the dev server's base-mismatch hint page.

## Tests

Test files use **literal strings** for `initialEntries`, route assertions, and
fixture data. Do not import `ROUTES` in tests — concrete strings make test
intent obvious and decouple tests from production routing changes.
