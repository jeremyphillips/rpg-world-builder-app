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

Optional `provenance` on `contentMetaSchema`. It is never an empty object.

- **`documents`** — homebrew records that declare which registered documents
  they draw from. System records use the ruleset’s documents instead.
- **`citation`** — record-level location. Valid for every registered document.
- **`excerpt`** — record-level passage. Only for documents with `storeText`.
- **`derivedFrom`** — duplication lineage (`relation: 'duplicate'`).

## Entry provenance

`CONTENT_TYPE_CAPABILITIES.provenanceEntryHosts` lists the nested arrays that
may carry `provenance`. Monsters opt in `actions`, `bonusActions`, `reactions`,
and `traits`. Every other content type uses an empty list until its own import.
Each entry holds at most one excerpt. Several entries may share one excerpt.

## Write authority

`reconcileContentProvenance` runs in the shared content write path. Route
handlers cannot choose the mode.

- **`preserve`** — public create, update, and patch. Clients cannot set record
  provenance. On homebrew, entry provenance is matched by stable id: omission
  keeps the stored value, an equal value is accepted, and a new or different
  value is rejected. A system patch cannot store provenance. The read merge
  reattaches the seed’s entry provenance after the patch is applied.
- **`carry`** — duplication only. Sets `derivedFrom` and inherited `documents`,
  and copies record `citation` / `excerpt` plus entry provenance.
- **`initialize`** — capture and import tooling. May set record and entry
  provenance. Each citation or excerpt document must belong to the record, and
  every excerpt reference must exist in the caller’s excerpt store.

Ordinary homebrew has no provenance. Forms do not expose it.

## Source excerpts

Append-only passages live in `@rpg/catalog/source-excerpts`, outside canonical
bodies. A revision’s fingerprint is `sha256` of its canonical JSON and is
recorded in `excerpts.lock.json`. Corrections append a new revision. They do
not edit the locked one. `resolveSourceExcerpt` returns the latest revision,
`missing`, `restricted`, or `unavailable`. It never substitutes catalog prose.
Runtime and dashboard modules do not import the store.

The authoring comparison UI and a public provenance endpoint are not built yet.

### First import

SRD 5.2.1 monsters: Kobold Warrior, Skeleton, Knight, Mage, and Hell Hound.
Passages were transcribed from the CC-BY PDF with `page-chrome`, `line-rejoin`,
`whitespace`, and `unicode-nfc` cleanup. Each canonical entry in that batch
draws from one passage, so multi-excerpt entries were not added. Record
provenance on those seeds is a citation (section and page). Skeleton’s citation
is page 325, where that stat block starts; its action passages continue on
page 326. Full stat-block tables are not stored as record excerpts because the
PDF text layer mixes the ability table with page chrome.

Capture: `pnpm exec tsx packages/catalog/scripts/capture-source-excerpts.mjs --input <file> --out <dir> [--seeds <seed.json>]`.
The input file is not committed. The excerpt store is the only persisted
original-text artifact.

## Compliance review

When a PR touches registry attribution, license, access rules, [`NOTICE`](../../../NOTICE),
or derivative modification wording, complete the
[content provenance compliance checklist](../../../.github/content-provenance-compliance-checklist.md).

The NOTICE parity test is a regression guard only — it does not replace that review.
