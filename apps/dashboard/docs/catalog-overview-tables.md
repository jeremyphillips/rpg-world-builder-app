# Catalog overview tables

Non-content catalog lists (NPCs, homebrew vocabulary, and similar) share the
`CatalogOverviewTable` shell in `src/lib/data-table/`. Campaign **content**
lists keep `ContentOverviewTable` for discovery policy, bulk selection, and
campaign-access chrome.

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

## When to use each shell

| Shell                  | Use for                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `ContentOverviewTable` | Campaign content overviews — filters, bulk selection, campaign access, two-line name cell |
| `CatalogOverviewTable` | Non-content lists — utility strip, column prefs, optional `FilterBar` slot                |

`CatalogOverviewTable` composes `DataTable` with:

- Result count + column visibility utility strip
- Column visibility/order prefs (`catalog-overview-preferences.ts`)
- Optional `filterSchema` + `FilterBar` / `FilterAdvancedPanel` (no discovery or bulk logic)

NPC overview is the reference consumer: class/species columns, equals filters
from `CharacterBuildCatalogIndex`, and no summary column.

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
