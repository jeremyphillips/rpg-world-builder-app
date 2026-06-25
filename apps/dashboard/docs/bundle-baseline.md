# Dashboard bundle history

Historical scorecard from the 2026-06-24 bundle reduction pass. For splitting
conventions and how to run the analyzer, see [code-splitting.md](./code-splitting.md).

Chunk **filenames are content-hashed** and change every build — compare sizes via
`pnpm --filter @rpg/dashboard analyze`, not by matching names in this doc.

## Baseline (2026-06-24, pre-optimization)

Single main JS chunk; Inter + Lora fonts. Vite warned the main chunk exceeded
500 kB.

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

## After Phase 1 — Inter only (2026-06-24)

| Asset                     |      Raw |    Gzip | Delta vs baseline         |
| ------------------------- | -------: | ------: | ------------------------- |
| `index-*.js` (main chunk) | 1,494 kB |  453 kB | unchanged                 |
| `index-*.css`             |  85.4 kB | 13.8 kB | ~4 kB smaller             |
| Inter fonts (woff2)       |  ~218 kB |       — | Lora gone (~158 kB saved) |

## Final state — after all phases (2026-06-24)

Phases 2–4 added lazy routes, lazy form fields, and per-family equipment columns.
Phase 5 added [`manualChunks`](../vite.config.ts) for stable vendor splits. Vite
no longer warns about a single chunk exceeding 500 kB.

| Chunk                |    Raw |     Gzip | Loaded when                              |
| -------------------- | -----: | -------: | ---------------------------------------- |
| Entry `index-*.js`   |  30 kB | **8 kB** | app bootstrap                            |
| `vendor-react-*.js`  | 178 kB |    56 kB | app bootstrap                            |
| `vendor-router-*.js` |  94 kB |    31 kB | app bootstrap                            |
| `vendor-query-*.js`  |  36 kB |    11 kB | app bootstrap                            |
| `vendor-radix-*.js`  | 150 kB |    46 kB | first Radix UI (forms, modals, tables)   |
| `vendor-tiptap-*.js` | 414 kB |   129 kB | first richtext field                     |
| `vendor-dnd-*.js`    |  55 kB |    18 kB | DataTable column reorder / editable grid |
| `vendor-table-*.js`  |  50 kB |    13 kB | first DataTable overview                 |

Per-route async chunks (0.3–23 kB each, plus shared `src-*.js` helpers) load on
first visit to that screen. TipTap and heavy form defs stay off the entry path.

## Optimization summary

| Milestone | Entry JS (gzip) | Notes                                      |
| --------- | --------------: | ------------------------------------------ |
| Baseline  |          453 kB | monolith + Lora fonts                      |
| Phase 1   |          453 kB | fonts only (~158 kB woff2 saved)           |
| Final     |        **8 kB** | lazy routes/fields + vendor `manualChunks` |

Intermediate steps (lazy routes → lazy fields → equipment columns) are recorded
in [`.cursor/plans/dashboard_bundle_reduction_48110d03.plan.md`](../../../.cursor/plans/dashboard_bundle_reduction_48110d03.plan.md).

## Completed work

- Remove Lora; alias display typography to Inter
- Route-level `React.lazy` via [`lazy-routes.ts`](../src/app/lazy-routes.ts)
- Lazy heavy form fields in `@rpg/ui/form`
- Per-family equipment column dynamic imports
- Vendor `manualChunks` in Vite config
