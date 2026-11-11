# Effect resolution — monster actions

**Status:** `save` actions store `effectResolutionSchema` plus `dcSource`.
Other kinds do not. See [action-architecture.md](../action-architecture.md) and
[monster-stat-blocks.md](../monster-stat-blocks.md).

## Kinds

| Kind                                 | Resolution                                                         |
| ------------------------------------ | ------------------------------------------------------------------ |
| `weapon`, `natural-weapon`, `attack` | Attack profile. On-hit riders are ordered effects, not an envelope |
| `save`                               | Envelope. Method must be `saving-throw`. Damage effects only       |
| `multiattack`                        | Steps of `{ count, actionIds }`. Not an envelope                   |
| `attack-sequence`                    | The same steps, only in Legendary Actions. Optional `lead`         |
| `spell`                              | Referenced spells. Each spell keeps its own resolution             |
| `special`                            | Prose                                                              |

The section places the row. `multiattack` is valid only in `actions`.
`attack-sequence` is valid only in `legendaryActions`. Each legendary row
spends one use from `legendaryActionUses`. `onceUntilNextTurn` is a stat-block
sentence, not `limitedUse` and not encounter state. `spellInvocation:
'use-entry'` requires the spell on the referenced spellcasting action.
Condition-primary saves stay on `save-conditions`. There is no movement
resolver and no per-option cost.

## On hit

`onHit.effects` is an ordered list on those attack kinds: `damage`, `condition`, or `note`. Primary damage stays on the attack. The attack profile resolves damage riders once and carries conditions and notes for the same sentence. They do not change the attack bonus or the damage total. A condition description is a qualification, not a duration model. A note is presentation only.

A weapon magic-property preset may carry the same object when the rider always applies. Conditional activation, including Flame Tongue while ablaze, stays in the property description and is not added to the attack.

## `save` shape

Published saves require an area from self, or one creature at reach or at a
distance. Outcomes are `failed-save` and an optional `successful-save`.
`automatic` methods, `point` selection, healing, and temporary hit points are
rejected.

A future no-check effect would be its own kind holding the same envelope with
`method.kind: 'automatic'`. Do not widen `save` for that.

`preset` is provenance only. A missing or unknown id still parses.

## Inherited from base

See [base.md](./base.md). Spell progression, spell attack types, and projectiles
stay on the spell adapter.
