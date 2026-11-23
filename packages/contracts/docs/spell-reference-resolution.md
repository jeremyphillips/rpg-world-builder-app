# Spell reference resolution and display

Contracts boundary for persisted spell ids: **identity → scoped catalog → typed outcome → display policy → layout**.

Depth on activation and limited use: [activation-and-limited-use.md](./activation-and-limited-use.md#spell-references). Validation messages: [catalog-reference-issues](../src/rpg/content/lib/catalog-reference-issues.ts) (`authoredSpellIdsEdge`).

## Identity (unchanged)

- Persisted references are canonical content ids: `<rulesetId>:<slug>` (system) or Mongo id (homebrew).
- [`resolveSpellReference`](../src/rpg/content/spell/spell-reference.ts) is `spellsById.get(ref)` only — no slug equivalence, namespace stripping, or combobox option lookup.

## Authoritative catalog scope (authoring)

Dashboard authoring builds **`ContentFormCtx.spellCatalogById`** from the campaign spells list query (`useSpells` / `listSpells`): system seed plus homebrew for the campaign ruleset. Keys are `spell.id`; the map includes **all viewer-visible rows** returned by the list API, including drafts.

| Source                            | Use                                                                         |
| --------------------------------- | --------------------------------------------------------------------------- |
| `spellCatalogById`                | **Presentation and resolution** lookup                                      |
| `options.spells.forReference()`   | **New selection** in comboboxes (`isContentReferenceable` — excludes draft) |
| `options.spells.forCampaignUse()` | Play / campaign eligibility — separate from reference identity              |

**Not present in a picker does not mean unresolved:** a persisted grant may reference a spell that is still in `spellCatalogById` but omitted from `forReference()`. Resolution shows `spell.name` when the id is in the map; referenceability is enforced by validation on publish (`spell_not_referenceable`).

**Not-found (`unknown-spell`)** may be reported only when `spellCatalogLoadState === 'ready'` and the full list query has succeeded. Pending or error states must not classify references as missing.

API write validation uses the same id universe via `resolveCatalogForCampaign` and `collectSpellReferenceIssues` with `catalogStatus: 'ready'`.

## Catalog lifecycle (presentation)

| `AuthoringSpellCatalogStatus` | `SpellCatalogLoadState` | Before lookup     |
| ----------------------------- | ----------------------- | ----------------- |
| `pending`                     | `loading`               | `catalog-loading` |
| `error`                       | `error`                 | `catalog-error`   |
| `ready`                       | `ready`                 | exact-id lookup   |

Helpers: [`spell-catalog-context.ts`](../src/rpg/content/spell/spell-catalog-context.ts) (`mapAuthoringSpellCatalogLoadState`, `createSpellCatalogContext`, `isSpellCatalogAuthoritativeForReferenceLookup`).

Validation collectors keep `catalogStatus: 'ready' | 'unavailable'` and collapse pending+error to `unavailable` **for validation only** — presentation must use the three-state mapping above.

Facing preview uses `FacingReason` `catalog-pending` / `catalog-error` with `FacingCatalogCode` `'spells'`; dashboard adapters should align copy with [`SPELL_REFERENCE_DISPLAY_MESSAGES`](../src/rpg/content/spell/spell-catalog-context.ts).

## Resolution vs referenceability vs validation vs presentation

| Layer            | Question                                        | Owner                                                                           |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| Resolution       | Definition exists in authoritative map?         | `resolveSpellReference` / Phase B `resolveSpellReferenceOutcome`                |
| Referenceability | May this row be newly referenced?               | `isContentReferenceable`, `collectSpellReferenceIssues`                         |
| Validation       | Legal on save/publish for this intent?          | API hooks, form schema, issue codes                                             |
| Presentation     | What name or lifecycle label does the user see? | `SPELL_REFERENCE_DISPLAY_MESSAGES` → Phase B `presentSpellReferenceDisplayName` |

Resolved draft spell in map → display **actual `spell.name`**. Publish eligibility → validation message, not faux missing state.

## Display policy (contracts-owned)

[`SPELL_REFERENCE_DISPLAY_MESSAGES`](../src/rpg/content/spell/spell-catalog-context.ts):

| Semantic reason                         | Message                                  |
| --------------------------------------- | ---------------------------------------- |
| `unknown-spell`                         | Spell reference unavailable              |
| `catalog-loading`                       | Loading Spells… (via content-type terms) |
| `catalog-error` / `catalog-unavailable` | Could not load spells.                   |

Dashboard `MONSTER_LOADING_SPELLS` / `MONSTER_SPELL_CATALOG_ERROR` and character sheet `CHARACTER_SHEET_CATALOG_UNAVAILABLE_MESSAGES.spell` should converge on these strings in migration (Phase D).

Consumers must not use `formatContentReferenceLabel`, slug title-case, raw ids, or `FieldOption[]` labels for spell reference display.

## Reconciliation with existing systems

| System                          | Resolution                             | Display drift                 | Migration                            |
| ------------------------------- | -------------------------------------- | ----------------------------- | ------------------------------------ |
| `collectSpellReferenceIssues`   | Exact id; validation messages          | N/A                           | Keep                                 |
| `resolveMonsterReactionTrigger` | `unknown-spell`, `catalog-unavailable` | Downstream prose              | Delegate to shared outcome (Phase D) |
| Grant row presentation          | FieldOption / slug hacks               | Raw id / fabricated names     | Phase C                              |
| `formatSpellsGrantSentence`     | Optional callback                      | `?? id`                       | Phase B `…FromResolutions`           |
| `grant-display` compact summary | Vocabulary map                         | `formatSlugLabel`             | Phase D                              |
| Character sheet spell cards     | `catalogIndex.spells.get`              | `formatContentReferenceLabel` | Phase D                              |
| Monster `spellPlainName`        | Binary catalog flag                    | Collapsed unavailable         | Phase D                              |

Semantic reason for not-found: **`unknown-spell`** (same as reaction-trigger); do not introduce a parallel `unknown-reference` alias.

## Consumer matrix (tracking)

Priorities from the spell reference resolution plan: grant rows P0; grant-display/builder P1; monster/character/class P2–P3. Every path is either migrated or listed with an explicit deferral — consolidated display is not complete while P0–P2 paths invent local fallbacks.

## Cross-domain note

Equipment, skills, and slug-keyed content types use different reference keys. Reuse the **pattern** (lifecycle + exact lookup + display table), not spell id rules.

## Implementation phases

- **Phase A (this doc + `spell-catalog-context`)** — scope proof, lifecycle mapping, display ownership, reconciliation.
- **Phase B** — `SpellReferenceResolution`, `resolveSpellReferenceOutcome`, `presentSpellReferenceDisplayName`, grant sentence formatter.
- **Phase C+** — Grant UI and cross-surface migration per matrix.
