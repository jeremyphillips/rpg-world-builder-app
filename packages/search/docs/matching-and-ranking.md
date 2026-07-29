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
- No tokenization, punctuation folding, or diacritic folding in the baseline release.
- The whole normalized query string is matched per field (exact → prefix → substring).
- Document score is the best field score.

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

## Global search (principles only)

Future global search should reuse `@rpg/search` matching language and
`@rpg/search/ranking` mechanics, but ranking composition remains surface-local.
No canonical global pipeline is assumed across apps.

## Compatibility characterization

When migrating a surface, verify for representative queries:

- same candidate inclusion,
- same relevance tier/score,
- same `best_match` order (empty and non-empty queries),
- label-faithful explicit sorts,
- equal-score ties follow label / surface source-order rules.

See `apps/dashboard/src/features/character/lib/equipment/equipment-picker-search.lib.test.ts`
for equipment parity coverage against legacy `@rpg/ui` label scoring.
