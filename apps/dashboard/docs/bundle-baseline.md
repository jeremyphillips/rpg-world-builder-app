# Dashboard bundle baseline

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

## Targets for later phases

- ~~Remove Lora → drop ~158 kB font bytes~~ (done)
- ~~Lazy routes → split 1.5 MB main chunk by feature area~~ (done)
- Lazy form fields → defer TipTap and heavy field renderers
- `manualChunks` → cacheable vendor splits (react-table, tiptap, dnd-kit, radix)
