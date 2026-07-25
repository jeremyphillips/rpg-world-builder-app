# Catalog overview tables

Non-content catalog lists (NPCs, homebrew vocabulary, and similar) share the
`CatalogOverviewTable` shell in `src/lib/data-table/`. Campaign **content**
lists keep `ContentOverviewTable` for discovery policy, bulk selection, and
campaign-access chrome.

Both policy shells compose the neutral `OverviewTableFrame` — shared table
chrome with slots for toolbar, summary, utility actions, and selection controls.

## Layer contract

| Layer                 | May own                                                              | Must not own                                    |
| --------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `@rpg/contracts`      | Domain types, list enrichment DTOs (e.g. `ClassListItem.subclasses`) | React, tooltip copy with entity names           |
| `features/*`          | `resolve*SummaryItems`, column defs, filters, labels                 | Ad-hoc link/badge styling                       |
| `src/lib/data-table/` | Column recipes, generic aria, shell wiring                           | Subclass/class feature/species trait vocabulary |
| `@rpg/ui`             | `CollectionSummaryCell`, counter chrome, generic pluralization props | RPG schemas, subclass/feature/trait traversal   |

`CollectionSummaryCell` receives `singularLabel` / `pluralLabel` from feature
column defs (e.g. `"subclass"`, `"subclasses"`). The shared cell never imports
contracts or knows entity kinds.

## Architecture

```text
Neutral layer (src/lib):        Policy shells (features / src/lib):
  OverviewTableFrame              CatalogOverviewTable
  OverviewTablePreferences        ContentOverviewTable
  OverviewTableQueryState         future CharacterOverviewTable
  OverviewTableUtilityLayout      future PublicOverviewTable
```

Shared modules:

| Module                      | Path                                                 | Role                                                      |
| --------------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| `OverviewTableFrame`        | `src/lib/data-table/overview-table-frame.client.tsx` | Table chrome, slots, `DataTable` wiring                   |
| `createOverviewPreferences` | `src/lib/overview-preferences/`                      | Per-consumer prefs storage (visibility, order, page size) |
| `useOverviewQueryState`     | `src/lib/overview-query-state/`                      | URL or local filter/sort/page sync                        |

### State ownership

| State                     | Owner                                              |
| ------------------------- | -------------------------------------------------- |
| Column visibility / order | Preferences (localStorage)                         |
| Density                   | Preferences — content-only opt-in                  |
| Page size                 | Preferences                                        |
| Search / filter / sort    | URL query state                                    |
| Current page              | URL query state or transient — **not** preferences |
| Row selection             | Transient component state                          |

Page **index** is never persisted in preferences — only page **size**.

## When to use each shell

| Shell                  | Use for                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `ContentOverviewTable` | Campaign content overviews — filters, bulk selection, campaign access, two-line name cell |
| `CatalogOverviewTable` | Non-content lists — utility strip, column prefs, optional `FilterBar` slot                |
| `OverviewTableFrame`   | Direct composition when a policy shell is not needed (e.g. future public tables)          |

`CatalogOverviewTable` composes `OverviewTableFrame` with:

- Result count + column visibility utility strip
- Column visibility/order prefs (`catalog-overview-preferences.ts`)
- Optional `filterSchema` + `FilterBar` / `FilterAdvancedPanel` (no discovery or bulk logic)

NPC overview is the reference consumer: class/species columns, URL-synced equals
filters from `CharacterBuildCatalogIndex`, and no summary column.

Homebrew vocabulary (`creature-types`) uses `CatalogOverviewTable` with per-set
`tableKey` — same shell pattern as NPCs, no content-feature imports.

## `OverviewTableFrame` boundary

The frame **owns**:

- Table chrome and spacing
- Column visibility placement (via utility slot)
- Preference integration (passed through to `DataTable`)
- Utility-strip layout (summary / selection / utility action slots)
- Toolbar slot (filters live above the table)
- Table rendering (`DataTable` wiring)
- Empty-result state presentation
- Row/cell styling hooks

The frame **must not own**:

- Domain filters or filter schemas
- URL parameter schemas
- Selection semantics beyond passthrough props
- Bulk actions
- Campaign availability
- Authorization (public/private)
- Loading and errors
- Server fetching
- Formatted count language, content name cells, discovery suppression

### Client-data assumption

`OverviewTableFrame` receives a resolved client-side row collection. Server-driven
sorting, filtering, and pagination are outside the current contract and would
require controlled table-state props. Avoid APIs that imply the frame always
owns filtering and pagination.

### Loading / error ownership

Routes or page shells own loading, error, permissions, and empty-fetch states.
The table frame receives resolved data and owns only empty-result presentation.

| State                            | Owner                                                      |
| -------------------------------- | ---------------------------------------------------------- |
| "Could not load classes"         | Page/load boundary (`PageLoadState` / `OverviewPageShell`) |
| "No classes exist"               | Table empty state                                          |
| "No classes match these filters" | Filtered table empty state                                 |

Do not add `isLoading`, `error`, or skeleton behavior to the generic table API.

### Public-readiness constraints

- No assumption that rows have actions
- No assumption that column preferences are enabled
- No dependency on authenticated campaign context
- No requirement for selection or utility controls
- Empty toolbar and empty utility slots collapse cleanly
- Semantic table markup and captions remain valid without admin chrome
- Links and names are supplied by consumers, not resolved by the table layer

A public surface composes `OverviewTableFrame` directly or through a future
`PublicOverviewTable`. Admin-only behavior must never be required by the frame.

### Character-shell decision (recorded, not built)

NPCs use `CatalogOverviewTable` while character overviews remain simple
catalog-style lists. Introduce `CharacterOverviewTable` only when multiple
character surfaces require shared character-specific policy.

## Page shell

`OverviewPageShell` (`src/components/layout/overview-page-shell.tsx`) composes
`WidePage` + `PageHeader` + `PageLoadState` for overview routes. Content lists
use `ContentOverviewShell` (campaign-manager "New" gating). NPC overview uses
`OverviewPageShell` directly with custom route actions.

## Collection summary convention

Array-backed overview columns use `buildCollectionCountColumn` in
`column-builders.tsx`:

- **Trigger** — compact sortable count (`CollectionSummaryCell` quiet counter chrome)
- **Tooltip** — bounded name list on hover/focus; `+N more` when truncated
- **Empty** — non-interactive `—` (no tooltip)
- **Sort** — numeric count via `getCount`; preserve authored order in tooltip
  (`sortItems: false` unless caller opts in)
- **Badges** — reserved for semantic state, not collection counts

Domain adapters (`resolveSubclassSummaryItems`, `resolveSpeciesTraitSummaryItems`,
etc.) live beside feature column defs. Promote to a popover when entries need
links, grouping, scrolling, or rich `secondary` metadata.

## Related

- Content overview tables: [content-overviews.md](./content-overviews.md)
- Column builders and DataTable recipes: [feature-conventions.md § DataTable](./feature-conventions.md#datatable-column-recipes)
- `CatalogOverviewTable` module: `src/lib/data-table/catalog-overview-table.client.tsx`
- `OverviewTableFrame` module: `src/lib/data-table/overview-table-frame.client.tsx`
