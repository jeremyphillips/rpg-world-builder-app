# Monster action acquisition — SSOT notes

Supplements [`.cursor/plans/ssot_acquisition_audit_806f6d29.plan.md`](../../.cursor/plans/ssot_acquisition_audit_806f6d29.plan.md).

## Legendary category vocabulary

**Owner:** [`legendary-action-category.ts`](../src/features/content/monsters/lib/actions/legendary/legendary-action-category.ts)

- `LEGENDARY_ACQUISITION_CATEGORIES` — add-menu recipes (`legendary:*`).
- `LEGENDARY_EDITOR_ONLY_CATEGORIES` — `custom` (rows acquired via `create:special`, not `legendary:*`).
- `LEGENDARY_ACTION_CATEGORIES` — composition of the two (editor + acquisition identity).
- Parser, `MonsterActionAcquisitionChoice`, and `createLegendaryActionDraft` use `LegendaryAcquisitionCategory`.

Save legendary rows are **outside** this vocabulary (`legendaryActionCategory` returns `undefined` for `kind: 'save'`).

There is **no** second category authority: reaction recipes stay in [`monster-action-acquisition.ts`](../src/features/content/monsters/lib/actions/acquisition/monster-action-acquisition.ts) only.

## Action reference acquisition targets

**Owner:** [`action-reference-acquisition.ts`](../src/features/content/monsters/lib/actions/reference/action-reference-acquisition.ts)

`isActionReferenceAcquisitionTarget` — shared eligibility for reaction and legendary “use existing action” recipes (Actions-section source rows).

## Reaction acquisition categories

Declared only in [`monster-action-acquisition.ts`](../src/features/content/monsters/lib/actions/acquisition/monster-action-acquisition.ts) (single module). **No** separate reaction category registry — intentional.

## Facing vs authoring exhaustiveness

| Layer                       | Exhaustiveness                                                                                                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stat-block / preview facing | Exhaustive `switch` on `MonsterActionKind` in [`resolve-action-stat-block-rules-facing.ts`](../src/features/content/monsters/lib/presentation/resolve-action-stat-block-rules-facing.ts) |
| Authoring detail fields     | Per-kind branches in [`section-composers.tsx`](../src/features/content/monsters/lib/actions/detail-fields/section-composers.tsx) — manual when adding kinds                              |
| Draft acquisition           | No silent `special` fallback on unknown choice or preset (throws)                                                                                                                        |

## Schema vs acquisition policy (placement)

**Schema tuple** ([`section-tuples.ts`](../../../packages/contracts/src/rpg/content/monster/action/section-tuples.ts)) defines which kinds are mechanically valid per section. **`MONSTER_SECTION_KINDS`** is derived from those tuples. **Menu policy** should consult `monsterSectionAllowsKind` (and singleton / repeatability helpers), not hardcoded `section === '…'` checks, except where product rules intentionally scope an item (e.g. primary Spellcasting only on Actions).

| Kind           | In `actions` tuple? | In `bonusActions` tuple? | Menu today                                                                   | To offer on another section                                                                                        |
| -------------- | ------------------- | ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `teleport`     | Yes                 | Yes                      | `portableMovementItems` when `monsterSectionAllowsKind(section, 'teleport')` | **Registry-only** — already on Actions                                                                             |
| `leap`         | No                  | Yes                      | Same helper for `leap` (menu follows tuple until schema changes)             | **Schema required** — add `leapActionSchema` to `actionsSectionTuple`; menu then follows eligibility automatically |
| `take-actions` | No                  | Yes                      | `generalAcquisitionItems` bonus branch only                                  | **Schema required** for Actions; menu branch policy separate                                                       |

### Examples

- **Teleport as an Action:** supported today with zero schema work; Actions tuple already includes teleport; acquisition tests cover `create:teleport` on `section: 'actions'`.
- **Leap as an Action (hypothetical):** cannot be registry-only — `leap` is absent from the Actions tuple. After tuple change, remove any leftover section guards; `portableMovementItems` already keys off `monsterSectionAllowsKind`.
- **Primary Spellcasting:** constrained to Actions by product (`isPrimarySpellcastingAction` / move eligibility) — legitimate separation from “portable movement” kinds.

### Portable create kinds (`create:leap | teleport | take-actions`)

[`PORTABLE_CREATE_KINDS`](../../../packages/contracts/src/rpg/content/monster/action/monster-action-repeatability.ts) gates **singleton occurrence** for menu ids, not “bonus action kinds” as a domain label. Dashboard still lists portable kinds in the acquisition `create` branch and `createActionDraft`; defer a contracts export until placement policy for section-scoped create unions is explicit (plan findings F3, F4).

```text
section-tuples (Zod) → MONSTER_SECTION_KINDS → monsterSectionAllowsKind → acquisition menus
                                                      ↘ MONSTER_SINGLETON_KINDS / acquisitionStateForItem
```

## Deferred / follow-up (outside this audit closure)

- Section-scoped `create` kind unions tied to `MONSTER_SECTION_KINDS` (F4).
- Optional neutral shared label for cast-spell disabled copy (F14).
- Optional `satisfies Record<MonsterActionKind, …>` on detail composers (F11).
- `monsterActionAuthoring` unknown-kind policy (F16) — contracts layer, not acquisition menus.
