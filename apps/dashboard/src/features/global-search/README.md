# Global search

Campaign-scoped client-side search over the catalog snapshot from
`GET /api/campaigns/:campaignId/search/catalog`.

## Surfaces

| Surface      | Route / entry                     | Notes                         |
| ------------ | --------------------------------- | ----------------------------- |
| Results page | `/campaigns/:id/search?q=&group=` | Full list + segmented filters |
| Overlay      | Topbar trigger / ⌘K               | Grouped preview (≤4/group)    |

## Key files

- `api/global-search-catalog.ts` — snapshot fetch
- `lib/resolve-global-search-href.ts` — wire `target` → dashboard href
- `lib/rank-global-search.ts` — `@rpg/ui` ranking + grouping helpers
- `routes/global-search-page.tsx` — full results page
- `components/global-search-provider.client.tsx` — overlay + shortcut host

Public barrel exports trigger + provider only; route screens lazy-load from the app router.
