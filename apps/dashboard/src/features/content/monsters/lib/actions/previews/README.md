# Monster action form previews

Pure builders live here. Registered render components stay under
`components/form/slots/actions/*-preview.slot.tsx` (through Phase 6 Sub-phase E).

## Ownership

| Layer                                | Owns                                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `useMonsterActionPreviewContext`     | Whole-form `useWatch`, `findMonsterFormActionDraft`, `resolveMonsterEntryHeading` via `useMonsterActionPreviewTitle` |
| `buildMonsterAction*Preview`         | Rules text, unavailable guidance, reference resolution                                                               |
| `MonsterAction*RulesPreview` helpers | Mapping builder output → `RulesPreview` content kinds                                                                |
| `*.slot.tsx`                         | Kind guard, builder call, labels, layout exceptions (e.g. shape-shift dual panels)                                   |

Headings: [`resolveMonsterEntryHeading`](../../../../../../../packages/contracts/src/rpg/runtime/monster/resolve-monster-entry-heading.ts) only — no preview-local fallbacks.

Draft lookup: [`findMonsterFormActionDraft`](./monster-action-attack-summary.ts) only — no section-local `.find` on `reactions` / `bonusActions`.

## Per-kind retention (Phase 6 E)

| Kind                                   | Slot module                    | Builder                                | Notes                      |
| -------------------------------------- | ------------------------------ | -------------------------------------- | -------------------------- |
| Attack (weapon / natural / custom)     | `attack-preview.slot.tsx`      | `buildMonsterActionAttackPreview`      | Profile + metadata rows    |
| Spell / reaction spell                 | `spell-preview.slot.tsx`       | `buildMonsterActionSpellPreview`       | Section-aware label        |
| Multiattack                            | `multiattack-preview.slot.tsx` | `buildMonsterActionMultiattackPreview` | Prose                      |
| Parry                                  | `parry-preview.slot.tsx`       | `buildMonsterActionParryPreview`       | Reactions section          |
| Bonus (leap / teleport / take-actions) | `bonus-preview.slot.tsx`       | `buildMonsterActionBonusPreview`       | No unavailable branch      |
| Shape-shift                            | `shape-shift-summary.slot.tsx` | `buildMonsterActionShapeShiftPreview`  | Dual `RulesPreview` panels |

Trait rules preview uses `useMonsterEntryPreviewTitle` only — shared heading helper, not action orchestration.

## Subscriptions

Previews keep whole-form `useWatch` while a single selected master-detail row mounts one preview at a time. Narrowing field watches is deferred without mount evidence (Phase 6 N.7).

## Follow-up

Sub-phase F (section O of the slot architecture plan) may colocate `.slot.tsx` files under `components/form/actions/` by feature ownership after this matrix is stable.
