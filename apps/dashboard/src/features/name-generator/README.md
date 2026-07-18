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
