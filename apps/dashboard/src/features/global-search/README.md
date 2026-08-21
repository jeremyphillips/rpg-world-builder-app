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

## Component anatomy

```text
GlobalSearch
├── shared (components root)
│   ├── GlobalSearchProvider   — public; topbar open state + ⌘K (mounted in app shell)
│   └── GlobalSearchField      — shared input; topbar + results page
├── topbar/
│   ├── GlobalSearchTopbar     — public; composition root
│   ├── GlobalSearchTrigger    — private topbar affordance
│   └── GlobalSearchPreviewPanel — private; composes results presentation
└── results/
    ├── GlobalSearchResultsBody — page results surface (route composition)
    ├── result-lists module     — GlobalSearchGroupedResults + GlobalSearchFlatResults
    ├── GlobalSearchGroupSection
    ├── GlobalSearchResultRow
    └── GlobalSearchEmptyPrompt
```

**Import contract:** outside the feature → barrel (`GlobalSearchProvider`, `GlobalSearchTopbar`).
Inside the feature → direct owner-relative imports. Topbar may import `results/` presentation;
`results/` never imports `topbar/`.

**Root components rule:** keep a component at `components/` root when consumed by multiple
sibling surface families and neither family is the natural sole owner.

**Result modules:** `global-search-result-lists.tsx` holds reusable grouped/flat collection
compositors; `GlobalSearchResultsBody` is the full-page results surface (filters, loading, shell).

## Key files

- `api/global-search-catalog.ts` — snapshot fetch
- `lib/resolve-global-search-href.ts` — wire `target` → dashboard href
- `lib/rank-global-search.ts` — forgiving `@rpg/ui` ranking + grouping helpers
- `routes/global-search-page.tsx` — full results page
- `components/global-search-provider.tsx` — public shell entry; topbar open state + ⌘K
- `components/global-search-field.tsx` — shared search input
- `components/topbar/global-search-topbar.tsx` — public topbar composition root
- `components/results/global-search-results-body.tsx` — page results surface
- `components/results/global-search-result-lists.tsx` — grouped/flat result compositors

Public barrel exports `GlobalSearchProvider`, `GlobalSearchTopbar`, and `GlobalSearchTrigger`
(dead export follow-up: `GlobalSearchTrigger`, `useGlobalSearchContext`). Route screens
lazy-load from the app router.
