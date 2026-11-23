# Monster action acquisition — SSOT notes

Supplements [`.cursor/plans/ssot_acquisition_audit_806f6d29.plan.md`](../../.cursor/plans/ssot_acquisition_audit_806f6d29.plan.md) (Phases A–C implemented).

## Legendary category vocabulary

**Owner:** [`legendary-action-category.ts`](../src/features/content/monsters/lib/actions/legendary/legendary-action-category.ts)

- `LEGENDARY_ACQUISITION_CATEGORIES` — add-menu recipes (`legendary:*`).
- `LEGENDARY_EDITOR_ONLY_CATEGORIES` — `custom` (rows acquired via `create:special`, not `legendary:*`).
- `LEGENDARY_ACTION_CATEGORIES` — composition of the two (editor + acquisition identity).
- Parser, `MonsterActionAcquisitionChoice`, and `createLegendaryActionDraft` use `LegendaryAcquisitionCategory`.

Save legendary rows are **outside** this vocabulary (`legendaryActionCategory` returns `undefined` for `kind: 'save'`).

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

## Schema vs acquisition policy

- **Schema:** [`section-tuples.ts`](../../../packages/contracts/src/rpg/content/monster/action/section-tuples.ts) → `MONSTER_SECTION_KINDS`.
- **Menu policy:** acquisition builders should prefer `monsterSectionAllowsKind` over hardcoded `section === '…'` checks (leap on bonus remains a known coupling; see plan Phase E).

Teleport on Actions is schema- and menu-supported via eligibility checks today.

## Deferred findings (D–F)

Portable create-kind literals, section-scoped create unions, neutral cast-spell catalog disabled copy, leap menu policy alignment — see plan roadmap P3–P7.
