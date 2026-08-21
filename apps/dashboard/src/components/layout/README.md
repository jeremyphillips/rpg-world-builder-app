# Dashboard layout components

App chrome and reusable page layout primitives for the authenticated dashboard.
Feature-specific page recipes (catalog overview/detail shells, character sheets,
etc.) stay in their feature folders — see [`page/` boundary](#page-boundary) below.

## Where new files go

| Concern                                                                             | Location                                                                                                                                                                     |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application frame / shell integration (sidebar + topbar + breadcrumb rail + outlet) | [`shell/`](./shell/)                                                                                                                                                         |
| Global header, title slots, user menu                                               | [`topbar/`](./topbar/)                                                                                                                                                       |
| Breadcrumb resolution + rendering                                                   | [`breadcrumb/`](./breadcrumb/)                                                                                                                                               |
| Reusable page width, spacing, header, load state, index intro                       | [`page/`](./page/)                                                                                                                                                           |
| Sidebar navigation (scope switch, section builders, nav items)                      | [`sidebar/`](./sidebar/) — see [`sidebar-navigation.md`](../../../docs/sidebar-navigation.md)                                                                                |
| Cross-cutting pure layout logic shared by multiple chrome areas                     | layout **root** (e.g. [`resolve-dashboard-navigation-scope.ts`](./resolve-dashboard-navigation-scope.ts)); introduce `navigation/` or `lib/` only when 2+ such modules exist |
| Dashboard-wide promotional/card surfaces (exceptions, not layout chrome)            | layout **root** — [`promotion-card`](./promotion-card.tsx), [`starter-action-card`](./starter-action-card.tsx)                                                               |

## Import convention

| Relationship                                  | Rule                                       | Example                                                        |
| --------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| Same subfolder, co-located file               | Relative `./`                              | `./page-header` inside `page/`                                 |
| Cross subfolder within `layout/`              | `@/components/layout/<subfolder>/<module>` | `@/components/layout/topbar/topbar` from `shell/app-shell.tsx` |
| External consumers (features, routes, router) | `@/components/layout/<subfolder>/<module>` | `@/components/layout/page/wide-page`                           |

Do **not** add subfolder barrels (e.g. `@/components/layout/page`). Explicit deep
imports identify which layout primitive is consumed.

There is no root `layout/index.ts` barrel — `AppShell` stays a direct import so
eager router wiring does not pin the whole layout tree. See
[`code-splitting.md`](../../../docs/code-splitting.md).

## `page/` boundary

**`page/` owns:** generic page-level geometry and chrome shared across dashboard
features — width shells (`NarrowPage`, `WidePage`), spacing tokens, title row,
async load boundary, and thin composers built only from those pieces
(`OverviewPageShell`, `IndexPageIntro`).

**`page/` does not own:** feature-specific page recipes, even when they render
full pages:

- `ContentOverviewShell`, `ContentDetailLayout` — `features/content/lib/`
- Character/campaign/homebrew detail shells — respective feature folders

Page layout usage for routes → [`feature-conventions.md`](../../../docs/feature-conventions.md#page-layout).

## Root exceptions

`promotion-card` and `starter-action-card` are promotional/content surface
primitives, not frame or page geometry. They remain at layout root for historical
placement; optional follow-up is a dedicated `components/promotion/` folder or
route colocation if ownership clarifies further.

## Subtree map

```text
layout/
  shell/           AppShell, ConcentrationShell, app-shell.variants
  topbar/          Topbar, title slots, user menu
  breadcrumb/      AppBreadcrumb, label context, resolution hooks
  page/            NarrowPage, WidePage, PageHeader, PageLoadState, variants, overview/index intro
  sidebar/         Primary navigation — see sidebar-navigation.md
  resolve-dashboard-navigation-scope.ts
  promotion-card.*
  starter-action-card.*
```
