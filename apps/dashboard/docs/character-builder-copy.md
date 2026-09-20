# Character builder copy layers

How user-facing strings are sourced in the character builder. Heritage is the
reference implementation; subclass will follow the same pattern.

Resolver catalog: [character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md).
Message conventions: [validation-messages.md](../../../packages/contracts/docs/validation-messages.md).
Rules vocabulary (layer 1): [vocabulary.md](../../../docs/vocabulary.md).

## Three layers (do not mix)

| Layer                       | Owns                                        | Heritage example                                             | Home                                                          |
| --------------------------- | ------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| **1 — Rules vocabulary**    | Campaign-customizable reference option sets | Creature type, language labels                               | `docs/vocabulary.md`, `features/vocabulary/`                  |
| **2 — Content / ChoiceSet** | DM-authored rules-facing names              | `Elven Lineage`, `Giant Ancestry`, `Drow`                    | Catalog → `resolve*ChoiceSets()`                              |
| **3 — Builder UI copy**     | Workflow chrome (status, helpers, change)   | `Heritage required`, `Change heritage`, `Choose one option.` | `characterBuilderDependentChoiceMessages` in `@rpg/contracts` |

**Display vocabulary** (grant summaries, stat rows) is a fourth _resolution_ concern —
`GrantDisplayVocabulary`, `buildSpellGrantVocabulary`, `getCreatureTypeLabel` — not a
copy catalog. Keep in display libs; do not conflate with layer 3.

Rules vocabulary is **not** builder UI copy. Layer-2 headings may use words like
"Lineage" when authored in catalog content; layer-3 code uses domain terms
(`heritage`, `subclass`) — never display synonyms (`lineage`, `ancestry`) as
internal identifiers or workflow strings.

## Decision checklist

When adding a string:

1. Campaign-customizable rules option? → Layer 1 (rules vocabulary)
2. DM-authored content name? → Layer 2 (`choiceSet.label` / catalog field)
3. Builder workflow chrome? → Layer 3 (`characterBuilder*Messages` or dashboard formatters)
4. Varies per species/class in catalog copy? → Show layer 2 in headings; use **generic** layer 3 helpers (`Choose one option.`)
5. Internal code concept? → Use contracts domain term (`heritage`, `subclass`)

## Heritage copy contract (reference)

| Surface                 | Unresolved                               | Resolved          |
| ----------------------- | ---------------------------------------- | ----------------- |
| Parent card `titleMeta` | `Heritage required`                      | `Drow heritage`   |
| Section heading         | `Elven Lineage` (from `choiceSet.label`) | same              |
| Section status          | `Required`                               | `Selected: Drow`  |
| Section helper          | `Choose one option.`                     | _(none)_          |
| Panel affordance        | —                                        | `Change heritage` |

Catalog: `characterBuilderDependentChoiceMessages` in
`packages/contracts/src/rpg/runtime/character-builder/messages/character-builder-dependent-choice-messages.ts`.

Dashboard formatters in `lib/builder-parent-choice-status.lib.ts` and
`lib/builder-dependent-choice.lib.ts` assemble view models via `formatFieldMessage(...)`;
they do not own raw English strings.

Domain kinds: `DEPENDENT_CHOICE_KINDS` (`heritage`, `subclass`).

## Proficiency choice presentation (reference)

Proficiency ChoiceSets carry generic `ChoiceSetProvenance` (`ownerKind`, `ownerLabel`,
`featureLabel`, `choiceLabel`). `resolveProficiencyChoicePresentation()` resolves block
heading, optional source line, and `headingSourceCoverage` (`owner` | `feature` |
`generic`). Show the source line only when the heading does not already encode the owner.

| Coverage  | Heading examples                         | Source line                     |
| --------- | ---------------------------------------- | ------------------------------- |
| `owner`   | `Rogue Skills`, `Origin Languages`       | omitted                         |
| `feature` | `Skillful`, `Primal Aptitude`            | `Human species trait`, subclass |
| `generic` | `Skill Proficiency`, unlabeled languages | shown when provenance is known  |

**Single choice set** — category owns progress, action, supporting copy, optional
provenance, and the selected collection. `formatProficiencySingleSetSupportingCopy()` folds
choice-set identity and meaningful pool constraint into the category subhead (and optional
`identityLine` when the heading does not describe eligibility).

**Multiple choice sets** — category owns aggregate progress and generic instruction; each
block owns heading, progress, action, provenance, pool eligibility, and its selected
collection.

| Surface           | Single set                           | Multi set                               |
| ----------------- | ------------------------------------ | --------------------------------------- |
| Category subhead  | `Choose 2 skills from Rogue Skills.` | `Choose skills from the options below.` |
| Identity line     | `Keen Senses` (constrained feature)  | per block heading                       |
| Block source line | `Human species trait` (feature)      | per block                               |
| Pool description  | absorbed into subhead when relevant  | `Choose from Perception, …` per block   |

Block order within a category: class → subclass → species → heritage → origin → feat →
ruleset → campaign (stable within kind).

## Adjacent builder copy patterns

### ChoiceSet drawer headings and Add/Edit actions

Drawer **headings** stay stable and resolve from `formatChoiceSetDrawerHeading(choiceType)`
in `@rpg/contracts` (e.g. `Choose skill proficiency`, `Choose cantrip`, `Choose equipment`).
They do not flip to Add/Edit when a choice set is full.

Inline step actions and drawer **triggers** use `CHOICE_SET_DRAWER_LABELS` in
`lib/choice-sets/selection-counter.lib.ts` — Add vs Edit (proficiencies/languages) or Add vs
Manage (spells). Proficiency and language grants use `BUILDER_GRANT_EDIT_ACTION_LABEL` (`Edit`)
when full.

Per-card “Chosen from …” provenance on selected rows is intentionally omitted — section
headers and supporting copy provide enough context.

The `drawerLabelsForChoiceSet` fallback (`Manage ${choiceSet.label.toLowerCase()}`) is a
**legacy escape hatch only**. Add explicit map entries for new choice types instead of
deriving manage copy from rules-facing `choiceSet.label`.

### Species / class step sheet actions

Species and class option-sheet affordances (`Select species`, `Select class`, `Selected`
badge) live in `characterBuilderStepSelectionMessages` (`messages/character-builder-step-selection-messages.ts`).
Dashboard step components format via `formatFieldMessage(...)` — do not reintroduce inline
constants.

### Spell picker casting-time filters

Spell picker mechanics filters derive unit labels from `CASTING_TIME_UNIT_ENTRIES`
(`getCastingTimeUnitLabel`) plus duration for minute/hour buckets — do not duplicate
hardcoded casting-time strings in dashboard picker libs.

## Chrome-variant ownership watchlist

Promote strings into `characterBuilderChromeMessages` (variant-keyed) when a second
consumer needs the same route-independent shell copy. Current variant-specific catalogs:

| Variant                  | Owns                                   |
| ------------------------ | -------------------------------------- |
| `standalone_pc`          | PC create/review/draft-restore chrome  |
| `campaign_npc`           | NPC create/review/draft-restore chrome |
| `campaign_onboarding_pc` | Campaign character onboarding chrome   |

Do **not** fold variant-specific copy into cross-step catalogs (`characterBuilderStepSelectionMessages`,
`characterBuilderDependentChoiceMessages`) — those are variant-agnostic workflow strings.

## Related docs

- [character-builder.md](character-builder.md) — dashboard integration overview
- [validation-messages.md](../../../packages/contracts/docs/validation-messages.md) — `defineMessage` conventions
- [vocabulary.md](../../../docs/vocabulary.md) — rules vocabulary (layer 1)
