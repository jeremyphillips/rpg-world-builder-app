# Dashboard bundle baseline

For conventions and contributor rules, see [code-splitting.md](./code-splitting.md).
This file tracks measurement history.

Captured before bundle-size reduction work (single main JS chunk, Inter + Lora fonts).
Phase 1 (2026-06-24) removed Lora — Inter-only fonts; JS chunk unchanged.

## How to reproduce

```bash
pnpm --filter @rpg/dashboard analyze
open apps/dashboard/bundle-stats/stats.html
```

The treemap is gitignored; re-run `analyze` after changes to compare.

## Baseline (2026-06-24, pre-optimization)

| Asset                     |           Raw |        Gzip |
| ------------------------- | ------------: | ----------: |
| `index-*.js` (main chunk) |      1,494 kB |      453 kB |
| `index-*.css`             |         89 kB |       15 kB |
| **JS + CSS total**        | **~1,583 kB** | **~468 kB** |

Fonts (woff2, all emitted into `dist/assets/`):

| Family                   | Notable files                                    | Raw (sum of listed subsets) |
| ------------------------ | ------------------------------------------------ | --------------------------: |
| Inter                    | latin, latin-ext, cyrillic, greek, vietnamese, … |                     ~194 kB |
| Lora                     | latin, latin-ext, cyrillic, math, symbols, …     |                     ~158 kB |
| **Font total (approx.)** |                                                  |                 **~352 kB** |

Vite warns the main chunk exceeds 500 kB — expected until route-level code splitting lands.

## After Phase 1 — Inter only (2026-06-24)

| Asset                     |      Raw |    Gzip | Delta vs baseline         |
| ------------------------- | -------: | ------: | ------------------------- |
| `index-*.js` (main chunk) | 1,494 kB |  453 kB | unchanged                 |
| `index-*.css`             |  85.4 kB | 13.8 kB | ~4 kB smaller             |
| Inter fonts (woff2)       |  ~218 kB |       — | Lora gone (~158 kB saved) |

## After Phase 2 — lazy routes (2026-06-24)

| Asset                                     |            Raw |   Gzip | Notes                                                     |
| ----------------------------------------- | -------------: | -----: | --------------------------------------------------------- |
| Entry `index-*.js`                        |         213 kB |  66 kB | down from 1,494 kB / 453 kB (~85% gzip reduction)         |
| Shared chunk `page-spacing.variants-*.js` |         894 kB | 274 kB | DataTable, form layer, Radix — loads on first heavy route |
| Per-route chunks                          | 0.3–23 kB each |      — | 50+ async chunks (form defs co-located with edit routes)  |

Route modules load via `React.lazy` in [`src/app/lazy-routes.ts`](../src/app/lazy-routes.ts).
Feature barrels must not re-export route components (breaks splitting) — import routes only from the router lazy map.

## After Phase 3 — lazy form fields (2026-06-24)

Heavy `@rpg/ui/form` field types (`json`, `richtext`, `file`, `editableGrid`) load via
`React.lazy` in [`packages/ui/src/form/field-renderer.client.tsx`](../../../packages/ui/src/form/field-renderer.client.tsx).

| Asset                               |        Raw |      Gzip | Notes                                    |
| ----------------------------------- | ---------: | --------: | ---------------------------------------- |
| Entry `index-*.js`                  |     214 kB |     67 kB | unchanged vs Phase 2                     |
| Shared `page-spacing.variants-*.js` | **214 kB** | **65 kB** | down from 894 kB / 274 kB                |
| `rich-text-field-*.js` (TipTap)     |     419 kB |    131 kB | only on edit routes with richtext fields |
| `editable-grid.client-*.js`         |     160 kB |     46 kB | only when editableGrid fields render     |
| `file-field.client-*.js`            |       8 kB |      3 kB | deferred from core form chunk            |
| Core `form-*.js`                    |      62 kB |     20 kB | text/select/checkbox only                |

## After Phase 4 — equipment family columns (2026-06-24)

[`loadFamilyTableConfig`](../src/features/content/equipment/lib/shared/equipment-family-columns.ts)
dynamic-imports one family column module per overview route (weapons, armor, etc.).

| Asset                                                 |        Raw |    Gzip | Notes                                                     |
| ----------------------------------------------------- | ---------: | ------: | --------------------------------------------------------- |
| `equipment-family-overview-*.js`                      |       5 kB |  1.6 kB | down from ~7.5 kB; no longer bundles all 8 column modules |
| Per-family column chunks (e.g. `weapon-columns-*.js`) | ~1 kB each | ~0.6 kB | loaded only for the active family overview                |

## After Phase 5 — vendor `manualChunks` (2026-06-24)

Configured in [`vite.config.ts`](../vite.config.ts) — stable vendor filenames for caching
and clearer bundle analysis.

| Vendor chunk         |       Raw |     Gzip | Loaded when                              |
| -------------------- | --------: | -------: | ---------------------------------------- |
| `vendor-react-*.js`  |    178 kB |    56 kB | app bootstrap                            |
| `vendor-router-*.js` |     94 kB |    31 kB | app bootstrap                            |
| `vendor-radix-*.js`  |    150 kB |    46 kB | first Radix UI (forms, modals, tables)   |
| `vendor-tiptap-*.js` |    414 kB |   129 kB | first richtext field                     |
| `vendor-dnd-*.js`    |     55 kB |    18 kB | DataTable column reorder / editable grid |
| `vendor-table-*.js`  |     50 kB |    13 kB | first DataTable overview                 |
| `vendor-query-*.js`  |     36 kB |    11 kB | app bootstrap                            |
| Entry `index-*.js`   | **30 kB** | **8 kB** | down from 214 kB / 67 kB (Phase 3)       |

Vite no longer warns about a single chunk exceeding 500 kB.

## Optimization summary

| Milestone | Entry JS (gzip) | Notes                                             |
| --------- | --------------: | ------------------------------------------------- |
| Baseline  |          453 kB | monolith + Lora fonts                             |
| Phase 1   |          453 kB | fonts only                                        |
| Phase 2   |           66 kB | lazy routes                                       |
| Phase 3   |           67 kB | lazy form fields; shared chunk 65 kB gzip         |
| Phase 5   |        **8 kB** | vendor splits; TipTap isolated to `vendor-tiptap` |

## Targets for later phases

- ~~Remove Lora → drop ~158 kB font bytes~~ (done)
- ~~Lazy routes → split 1.5 MB main chunk by feature area~~ (done)
- ~~Lazy form fields → defer TipTap and heavy field renderers~~ (done)
- ~~Equipment family columns → per-family dynamic import~~ (done)
- ~~`manualChunks` → cacheable vendor splits~~ (done)
