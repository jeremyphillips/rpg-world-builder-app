# Character builder copy layers

How user-facing strings are sourced in the character builder. Heritage is the
reference implementation; subclass will follow the same pattern.

Resolver catalog: [character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md).
Message conventions: [validation-messages.md](../../../packages/contracts/docs/validation-messages.md).
Rules vocabulary (layer 1): [vocabulary.md](../../../docs/vocabulary.md).

## Three layers (do not mix)

| Layer                       | Owns                                        | Heritage example                                             | Home                                                          |
| --------------------------- | ------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| **1 — Rules vocabulary**    | Campaign-customizable reference option sets | Creature type, language labels                               | `docs/vocabulary.md`, `features/homebrew/lib/vocabulary/`     |
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
`packages/contracts/src/rpg/runtime/character-builder/character-builder-dependent-choice-messages.ts`.

Dashboard formatters in `lib/builder-parent-choice-status.lib.ts` and
`lib/builder-dependent-choice.lib.ts` assemble view models via `formatFieldMessage(...)`;
they do not own raw English strings.

Domain kinds: `DEPENDENT_CHOICE_KINDS` (`heritage`, `subclass`).

## Adjacent builder copy patterns

### ChoiceSet drawer Add/Manage pairs

`CHOICE_SET_DRAWER_LABELS` in `lib/selection-counter.lib.ts` keys explicit Add/Manage
pairs by `choiceType` — the preferred pattern for proficiency, spell, and equipment drawers.

The `drawerLabelsForChoiceSet` fallback (`Manage ${choiceSet.label.toLowerCase()}`) is a
**legacy escape hatch only**. Add explicit map entries for new choice types instead of
deriving manage copy from rules-facing `choiceSet.label`.

### Species / class step sheet actions (interim)

`SELECT_SPECIES_ACTION_LABEL`, `SELECT_CLASS_ACTION_LABEL`, and `Selected` badge copy
remain inline constants in step components. They are layer-3 workflow chrome and should
migrate to a contracts message catalog when species/class/subclass affordances are
consolidated.

## Related docs

- [character-builder.md](character-builder.md) — dashboard integration overview
- [validation-messages.md](../../../packages/contracts/docs/validation-messages.md) — `defineMessage` conventions
- [vocabulary.md](../../../docs/vocabulary.md) — rules vocabulary (layer 1)
