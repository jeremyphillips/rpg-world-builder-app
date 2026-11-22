# Monster action form previews

Pure builders live here. Registered preview slot components live under
`components/form/actions/{kind,sections,shared}/**/*.slot.tsx`.

## Ownership

| Layer                                | Owns                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `useMonsterActionPreviewContext`     | Whole-form `useWatch`, draft lookup, stat-block rules heading via `useMonsterActionRulesPreviewTitle` |
| `buildMonsterAction*Preview`         | Rules text, unavailable guidance, reference resolution                                                |
| `MonsterAction*RulesPreview` helpers | Mapping builder output → `RulesPreview` content kinds                                                 |
| `*.slot.tsx`                         | Kind guard, builder call, labels, layout exceptions (e.g. shape-shift dual panels)                    |

Headings: [`resolveMonsterEntryHeading`](../../../../../../../packages/contracts/src/rpg/runtime/monster/resolve-monster-entry-heading.ts) only — no preview-local fallbacks.

Draft lookup: [`findMonsterFormActionDraft`](./monster-action-draft-lookup.ts) only — no section-local `.find` on `reactions` / `bonusActions`.

## Per-kind retention (Phase 6 E)

| Kind                                   | Slot module                                        | Builder                                | Notes                      |
| -------------------------------------- | -------------------------------------------------- | -------------------------------------- | -------------------------- |
| Attack (weapon / natural / custom)     | `actions/attack/attack-preview.slot.tsx`           | `buildMonsterActionAttackPreview`      | Profile + metadata rows    |
| Spell / reaction spell                 | `actions/spell/spell-preview.slot.tsx`             | `buildMonsterActionSpellPreview`       | Section-aware label        |
| Multiattack                            | `actions/multiattack/multiattack-preview.slot.tsx` | `buildMonsterActionMultiattackPreview` | Prose                      |
| Parry                                  | `actions/parry/parry-preview.slot.tsx`             | `buildMonsterActionParryPreview`       | Reactions section          |
| Bonus (leap / teleport / take-actions) | `actions/sections/bonus-preview.slot.tsx`          | `buildMonsterActionBonusPreview`       | No unavailable branch      |
| Shape-shift                            | `actions/shape-shift/shape-shift-summary.slot.tsx` | `buildMonsterActionShapeShiftPreview`  | Dual `RulesPreview` panels |

Trait rules preview uses `useMonsterTraitRulesPreviewPresentation`; action slots share `MonsterActionRulesPreview` presentation only.

## Subscriptions

Previews keep whole-form `useWatch` while a single selected master-detail row mounts one preview at a time. Narrowing field watches is deferred without mount evidence (Phase 6 N.7).
