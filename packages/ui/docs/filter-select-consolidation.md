# Filter select consolidation (Phase 1b gate)

## Decision: **(A) extract shared module**

| Item               | Choice                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Shared module      | `packages/ui/src/filters/shared-filter-select.client.tsx`                                         |
| Wire value for All | `FILTER_SELECT_ALL_VALUE` from `filter-bar.variants.ts` (`__all__`)                               |
| Dependency rule    | `@rpg/ui/form` may import `@rpg/ui/filters`; `@rpg/ui/filters` must **not** import `@rpg/ui/form` |

## Phase split

| Phase | Work                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| **2** | Combobox panel toolbar uses `SharedFilterSelect` (injects All row; concrete slugs only in config)                    |
| **4** | Refactor `FilterSelectControl` menu onto `SharedFilterSelectMenu`; combobox toolbar uses `SharedFilterSelect` (done) |

## Outcome (C) criteria (not chosen)

If consolidation were deferred, acceptance would require ≤2 select implementations (overview control + combobox) with no third interim control. Outcome **(A)** was chosen to avoid that drift.

## All semantics

Dimension filtering uses `FilterDimensionValue = string | undefined`. Select adapters map `undefined` ↔ `FILTER_SELECT_ALL_VALUE` at the UI boundary only.
