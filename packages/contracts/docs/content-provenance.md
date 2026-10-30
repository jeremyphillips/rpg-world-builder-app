# Content provenance

Bibliographic attribution and duplication lineage for catalog content. Gameplay
grant provenance (`CharacterSelectionSource`) is a separate system — a bare
`source` / `sources` in character-builder code refers to grants only.

## Catalog layer vs vocabulary option source

- **`catalogLayer`** (`system` | `homebrew`) — envelope field on catalog records
  and starting-wealth tables. Labels live in `CATALOG_LAYER_ENTRIES`
  (`@rpg/contracts/vocab`).
- **`VOCABULARY_OPTION_SOURCES`** (`system` | `campaign`) — resolve-time label
  for vocabulary option rows (seed vs ruleset-patch). Not stored on content
  envelopes and not renamed to `catalogLayer`.

## Source documents

Code-owned registry: `SOURCE_DOCUMENT_ENTRIES` and
`SYSTEM_RULESET_SOURCE_DOCUMENTS` in `@rpg/contracts` provenance primitives.
Legal text remains in the repo root [`NOTICE`](../../../NOTICE); registry changes
require the compliance checklist below.

## Record provenance

Optional `provenance` on `contentMetaSchema`:

- **`documents`** — homebrew originals that declare which registered documents
  they draw from.
- **`citation` / `excerpt`** — record-level location or passage (excerpt store: P2).
- **`derivedFrom`** — duplication lineage (`carry` write mode).

Public create/update routes use **`preserve`** authority: clients cannot set or
change record provenance; omission on update keeps stored values.

## Compliance review checklist

When a PR touches registry attribution, license, access rules, [`NOTICE`](../../../NOTICE),
or derivative modification wording, confirm:

- [ ] CC-BY-4.0 attribution wording matches the registry `attributionStatement`
- [ ] Change notice covers modified / reshaped / abbreviated SRD usage
- [ ] License link: https://creativecommons.org/licenses/by/4.0/legalcode
- [ ] Derivative homebrew statement remains accurate

The NOTICE parity test is a regression guard only — it does not replace this review.
