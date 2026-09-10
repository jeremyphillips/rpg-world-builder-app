# Name generator (dashboard)

Experimental standalone page for browsing naming contexts and generating names.

## Scope

- Filter-driven convention recommendation and seeded name generation
- Campaign-resolved species conventions composed with static exceptional conventions

## Pipeline

```text
useSpecies(activeCampaign)
  → composeNameGeneratorConventions(species)
      resolveCampaignConventions(CULTURE_CONVENTION_BINDINGS)
      resolveStandaloneConventions(STANDALONE_NAMING_CULTURES)
      listStaticConventions()
  → recommendNameGeneratorMatches / generateNameBatch
```

Species filter options come from `buildSpeciesNamingOptions` inside
`composeNameGeneratorConventions` — not raw seed JSON or `NAMING_CULTURES`.

## Filters

`subjectKind` drives which other filters are visible
(`model/name-generator.constants.ts`). Subjects with named conventions today:
person, family, clan, settlement, landmark, faction/organization.

The Heritage filter appears only when the selected species has heritages that
name differently from its base culture (`heritageOptions` on
`SpeciesNamingOption`, derived from `HERITAGE_NAMING_CULTURES`). Selecting one
also selects the culture it routes to, so recommendation scoring sees e.g.
`elven-drow` rather than `elven`; changing species clears it.

The Region filter appears only when a region-bearing convention is in scope for
the current subject. Language, culture, and region option lists are derived from
the conventions that still match the other selected filters — offered values
must produce at least one recommendation (`model/filter-matrix.test.ts`).

Results are cleared whenever the filter combination has no matching convention,
so the list never shows names from a stale selection.

## Key paths

| Path                                          | Role                                              |
| --------------------------------------------- | ------------------------------------------------- |
| `routes/name-generator-route.tsx`             | Route screen (lazy-loaded)                        |
| `hooks/use-name-generator-page.ts`            | Page state machine                                |
| `model/compose-name-generator-conventions.ts` | Explicit convention composition                   |
| `model/`                                      | Pure filter, recommendation, and generation logic |

See also:

- [`packages/name-generator-data/README.md`](../../../../packages/name-generator-data/README.md)
- [`packages/name-generator-integrations/README.md`](../../../../packages/name-generator-integrations/README.md)

## Out of scope

- Character, location, or faction form integration
- Saved names, URL-synced filters, manual convention selection
