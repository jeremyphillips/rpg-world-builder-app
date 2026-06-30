# Dashboard code splitting

The dashboard SPA is split so the entry chunk stays small and heavy surfaces load
on demand. Entry JS is ~8 kB gzip (down from a ~453 kB monolith); TipTap, form
defs, and DataTable ride in route or vendor chunks instead.

For before/after size history, see [bundle-baseline.md](./bundle-baseline.md).

## Where splitting lives

| Layer                      | Location                                                                                                                        | Loads when                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Route screens              | [`src/app/lazy-routes.ts`](../src/app/lazy-routes.ts)                                                                           | First visit to that route                                                        |
| Route Suspense fallback    | [`src/app/route-suspense.tsx`](../src/app/route-suspense.tsx)                                                                   | While a lazy route chunk resolves                                                |
| Heavy form fields          | [`packages/ui/src/form/renderers/field-renderer.client.tsx`](../../../packages/ui/src/form/renderers/field-renderer.client.tsx) | First render of `json`, `richtext`, `file`, or `editableGrid` fields             |
| Equipment overview columns | [`equipment-family-overview-columns.ts`](../src/features/content/equipment/lib/shared/equipment-family-overview-columns.ts)     | Per-family overview route                                                        |
| Vendor libraries           | [`vite.config.ts`](../vite.config.ts) → `manualChunks`                                                                          | First use (React/router/query at bootstrap; TipTap, table, dnd, Radix on demand) |

## Eager vs lazy routes

**Eager** (static imports in [`router.tsx`](../src/app/router.tsx)):

- `AuthGuard`, `AppShell`, `ConcentrationShell`
- `DashboardHome` (first paint after auth)

**Lazy** (everything else): registered in `lazy-routes.ts` and wrapped with
[`withRouteSuspense`](../src/app/with-route-suspense.tsx).

## Adding a new route

1. Create the screen under `src/features/<feature>/routes/` (or `src/routes/`).
2. Register it in `lazy-routes.ts` with `lazyNamed(() => import('…'), 'ExportName')`
   and `withRouteSuspense`.
3. Wire the path in `router.tsx` using the wrapped export from `lazy-routes.ts`.
4. Add navigation paths to [`src/app/routes.ts`](../src/app/routes.ts) — see
   [routing conventions](../../../docs/routing.md).

Keep form-def side-effect imports **inside** the route module (e.g.
`import '../lib/class-form-def'`) so they defer with the route chunk.

## Contributor rules

- **Import route files directly** in `lazy-routes.ts` — e.g.
  `@/features/content/spells/routes/spell-edit`, not `@/features/content`.
- **Do not re-export route screens** from a feature `index.ts` barrel. Barrel
  re-exports pull route modules into whatever imports the barrel and defeat
  splitting. See [feature-conventions.md](./feature-conventions.md).
- **Do not import heavy field modules eagerly** in dashboard code — use
  `@rpg/ui/form`; lazy field loading is handled in the shared field renderer.
- **Prefer route-level lazy** over component-level lazy unless the analyzer shows
  duplicated heavy chunks across routes.

## Dev vs production

Vite dev serves unbundled ESM. Each `React.lazy` navigation triggers many
module requests and on-the-fly transforms, so route spinners can linger ~1 s in
dev even when production is fast.

Judge bundle impact and navigation speed with a production build:

```bash
pnpm --filter @rpg/dashboard build
pnpm --filter @rpg/dashboard preview
```

Open DevTools → Network (disable cache once, then repeat navigation). Repeat
visits should transfer little or nothing once chunks are cached.

## Analyzing chunk sizes

```bash
pnpm --filter @rpg/dashboard analyze
open apps/dashboard/bundle-stats/stats.html
```

Re-run after changes that affect imports or `manualChunks`. Historical sizes
live in [bundle-baseline.md](./bundle-baseline.md).
