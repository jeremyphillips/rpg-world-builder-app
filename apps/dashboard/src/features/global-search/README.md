# Global search

Campaign-scoped client-side search over the catalog snapshot from
`GET /api/campaigns/:campaignId/search/catalog`.

## Surfaces

| Surface      | Route / entry                     | Notes                         |
| ------------ | --------------------------------- | ----------------------------- |
| Results page | `/campaigns/:id/search?q=&group=` | Full list + segmented filters |
| Topbar       | Expanding input / ⌘K              | Grouped preview (≤4/group)    |

## Invariants

- **Navigable destinations:** if search returns a document to a viewer, its
  resolved destination must be reachable under the same authoritative access
  model used by that feature (no dead-end hits). Character/NPC adapters must
  only project rows whose detail and related campaign sheet reads succeed for
  that viewer.
- **Visibility:** adapters project from authoritative list/resolvers; they do
  not invent parallel permission filters.
- **Routing:** API emits structured `target` values; dashboard resolves
  `ROUTES.campaign.search` / content / character hrefs.

## Key files

- `api/global-search-catalog.ts` — snapshot fetch
- `lib/resolve-global-search-href.ts` — wire `target` → dashboard href
- `lib/rank-global-search.ts` — forgiving `@rpg/ui` ranking + grouping helpers
- `routes/global-search-page.tsx` — full results page
- `components/global-search-topbar.client.tsx` — expanding topbar input + preview panel
- `components/global-search-provider.client.tsx` — open state + shortcut host

Public barrel exports topbar + provider only; route screens lazy-load from the app router.
