# Matching and ranking

Framework-neutral candidate matching lives in `@rpg/search`. Generic ordering
mechanics live in `@rpg/search/ranking`. Apps assemble searchable documents,
compose ranking pipelines, and render results.

## Match vs order

| Concern            | Owner         | Question                                                    |
| ------------------ | ------------- | ----------------------------------------------------------- |
| **Matching**       | `@rpg/search` | Does this document match the query? How strongly?           |
| **Ranking policy** | App / surface | Given matched candidates, in what order should they appear? |

Matching never decides permissions, selectability, routes, or grouping. Ranking
never re-implements normalization or substring scoring.

## Document shape

```ts
interface SearchDocument {
  id: string
  fields: readonly SearchField[]
}

interface SearchField {
  key: string
  text: string
  role?: 'primary' | 'secondary' | 'keyword'
  weight?: number // overrides role default weight when present
}
```

Projectors in `@rpg/contracts` expose **field helpers** (for example
`getEquipmentSearchName`). Surfaces assemble documents locally unless multiple
apps share the exact same picker intent.

## Normalization (B1 baseline)

- Query is trimmed and lower-cased.
- No tokenization or diacritic folding in the baseline release.
- The whole normalized query string is matched per field (exact → prefix → substring).
- Document score is the best field score.

### Forgiving profile (`profile: 'forgiving'`)

Opt-in separator-insensitive matching for surfaces like ComboboxField:

- Strips whitespace and common separators (`-`, `_`, `.`, `/`) from query and field text before a second match pass.
- Literal matching runs first; folded matching applies only when literal score is zero.
- Folded matches use lower tier scores so literal hits rank higher.
- Minimum folded query length: 3 characters.

Examples with forgiving profile:

| Query       | Field       | Match |
| ----------- | ----------- | ----- |
| `firebolt`  | `fire-bolt` | yes   |
| `fire ball` | `Fireball`  | yes   |
| `fire ball` | `Fire Bolt` | no    |

## Empty-query semantics

`matchSearchDocument` with an empty normalized query returns:

```ts
{
  matched: true
} // no tier, no score
```

Surfaces may short-circuit for performance, but the semantic result is include-all;
order comes from non-search ranking stages.

## Multi-token (future)

B1 uses the single-string model above. When multi-token ships, document explicitly:

- whether every token must match somewhere,
- whether phrase order matters,
- whether tokens may land on different fields.

## `best_match` vs explicit sort

| Sort mode                         | Primary key                       | Query tiebreaker                  | Domain tiebreaker              |
| --------------------------------- | --------------------------------- | --------------------------------- | ------------------------------ |
| `best_match`                      | search score when query non-empty | —                                 | recommendation / workflow rank |
| explicit (`name_*`, `price_*`, …) | label-faithful primary key        | search score when query non-empty | recommendation / workflow rank |

Recommendation ranks within comparable relevance only — it never outranks a
stronger textual match when a query is present.

## Comparator purity

Comparators passed to `chainComparators` are pure order functions:

- normalize strings before sort, not inside comparators,
- derive recommendation / eligibility / match state before sort,
- do not mutate rows or cache sort output.

## Source order

Input index (or equivalent) is attached when building ranked rows. It is not
stored on `SearchDocument` or `SearchMatch`.

## Example surface pipeline (equipment picker)

```text
resolve permitted candidates
  → enrich rows with assembled SearchDocument (dashboard)
  → score/filter with matchSearchDocument when query non-empty
  → sort via mode switch + chainComparators
  → render
```

Equipment `best_match` composition:

```text
if (hasQuery) searchScore desc
→ magicItemAction.rank (magic-items workflow only)
→ compareEquipmentPickerItemsByRecommendation
```

## Example surface pipeline (ComboboxField)

ComboboxField is **filter-only** — it preserves option list order and never
score-sorts. Selection pinning stays in `filterOptions` (`combobox-field.lib.ts`).

```text
options[]
  → assembleComboboxOptionSearchDocument per option (@rpg/ui)
  → matchSearchDocumentQuery for inclusion
  → pin selected values (even when non-matching or stale)
  → render filtered list in input order
```

Field mapping mirrors legacy `@rpg/ui` roles: `label` → `primary`, `value` →
`keyword`, `description` → `secondary`. Gate parity:
`packages/ui/src/components/ui/option-query.lib.test.ts`.

## Global search

Campaign-scoped global search uses a **presentation-first catalog snapshot** —
not a query API and not a third-party search engine.

### Wire shape

`GET /api/campaigns/:campaignId/search/catalog` returns
`{ documents: GlobalSearchDocument[], scope }` where each document carries:

- `filterGroup` — coarse segment (`characters` | `content` | `game-terms`)
- `typeLabel` — fine row label (`Spell`, `Character`, …)
- `title`, `secondary` — feature-owned presentation projected at index time
- `target` — structured destination (discriminated union); dashboard resolves `href`
- `fields` — weighted searchable text compatible with `@rpg/ui` legacy roles

Adapters **never** embed `@rpg/search` `SearchDocument`, attach scores, or emit
dashboard path strings.

### Source registry

API adapters implement `SearchSource.collect(ctx)` and call authoritative list /
resolver paths only:

| Source     | Authoritative entry points                                                    |
| ---------- | ----------------------------------------------------------------------------- |
| Content    | `resolveContentForCampaign` + campaign access + viewer filter                 |
| Game terms | `listResolvedVocabularySetsForCampaign` + `resolveVocabularyOptionsForViewer` |
| Characters | `listCampaignCharactersForViewer` + `listCampaignNpcs`                        |

Visibility, presentation, and routing ownership stay with those features.
Search adapters must only emit destinations that remain navigable for the
viewer under those same access paths.

### Client-side matching and surface-local ranking

Dashboard (and topbar preview) fetch the snapshot once, map `fields` through
`rankLegacySearchItems(..., 'forgiving')` via `@rpg/ui`, then compose ranking
and grouping locally. Page and topbar may diverge in caps and truncation;
adapters do not dictate order.

Empty-query surfaces should not rank or list the full catalog — prompt-only UX
is enforced in dashboard Phase 2, not by the snapshot endpoint.

## Compatibility characterization

When migrating a surface, verify for representative queries:

- same candidate inclusion,
- same relevance tier/score,
- same `best_match` order (empty and non-empty queries),
- label-faithful explicit sorts,
- equal-score ties follow label / surface source-order rules.

See `apps/dashboard/src/features/character/lib/equipment/equipment-picker-search.lib.test.ts`
for equipment picker gate parity against legacy `@rpg/ui` label scoring.

See `packages/ui/src/components/ui/option-query.lib.test.ts` for ComboboxField
inclusion parity against legacy `scoreItem`.
