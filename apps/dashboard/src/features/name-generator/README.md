# Name generator (dashboard)

Experimental standalone page for browsing naming contexts and generating names.

## Scope

- Filter-driven convention recommendation and seeded name generation
- Uses `@rpg/name-generator-core` and `@rpg/name-generator-data` — no campaign persistence

## Out of scope

- Character, location, or faction form integration
- Saved names, URL-synced filters, manual convention selection

## Key paths

| Path                               | Role                                              |
| ---------------------------------- | ------------------------------------------------- |
| `routes/name-generator-route.tsx`  | Route screen (lazy-loaded)                        |
| `hooks/use-name-generator-page.ts` | Page state machine                                |
| `model/`                           | Pure filter, recommendation, and generation logic |

See [`packages/name-generator-data/README.md`](../../../../packages/name-generator-data/README.md)
for language-as-affinity rules and dataset boundaries.
