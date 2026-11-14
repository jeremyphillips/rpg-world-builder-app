# Effect resolution — monster actions

**Status:** `save` actions store `effectResolutionSchema` plus `dcSource`.
Other kinds do not. See [action-architecture.md](../action-architecture.md) and
[monster-stat-blocks.md](../monster-stat-blocks.md).

## Kinds

| Kind                                 | Resolution                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `weapon`, `natural-weapon`, `attack` | Attack profile. On-hit riders are ordered effects, not an envelope         |
| `save`                               | Envelope. Method must be `saving-throw`. Damage effects only               |
| `multiattack`                        | Steps of `{ count, actionIds }`. Not an envelope. Valid only in Actions    |
| `action-reference`                   | Legendary only. `actionIds` name Actions rows. Optional movement allowance |
| `spell`                              | Referenced spells. Each spell keeps its own resolution                     |
| `special`                            | Prose, plus an optional prose saving throw                                 |

The section places the row. Legendary Actions accept only `action-reference`,
`spell`, and `special`. Rows do not move into or out of that section. Each
legendary row spends one use from `legendaryActionUses`. `onceUntilNextTurn` is
a stat-block sentence, not `limitedUse` and not encounter state. A legendary
`spell` row stores exactly one spell. `spellInvocation: 'use-entry'` is valid
only there and requires the spell on the referenced Spellcasting action.
Omitting it casts a catalog spell with a shared or explicit ability. A
legendary explicit ability is not itself a shared source. Condition-primary
saves stay on `save-conditions` and, in this section, on `legendary-saves`.
There is no movement resolver. `movement.allowance` is display copy only. There
is no per-option cost.

## On hit

`onHit.effects` is an ordered list on those attack kinds: `damage`, `condition`, or `note`. Primary damage stays on the attack. The attack profile resolves damage riders once and carries conditions and notes for the same sentence. They do not change the attack bonus or the damage total. A condition description is a qualification, not a duration model. A note is presentation only.

A weapon magic-property preset may carry the same object when the rider always applies. Conditional activation, including Flame Tongue while ablaze, stays in the property description and is not added to the attack.

## `save` shape

Published saves require an area from self, or one creature at reach or at a
distance. Outcomes are `failed-save` and an optional `successful-save`.
`automatic` methods, `point` selection, healing, and temporary hit points are
rejected.

A chosen creature may also carry `target.requirements`. Rows combine with
and. Listed creature types and conditions match any or none, as documented on
[`resolutionTargetRequirementsSchema`](../../src/rpg/content/lib/resolution/target-requirements.ts).
The stat-block sentence comes from `formatResolutionTargetFromParts`. These
requirements are authoring text. Play does not check them. Area occupants use
`occupantRequirements` on the envelope (self or point with an area), with the
same formatter composition helpers.

A future no-check effect would be its own kind holding the same envelope with
`method.kind: 'automatic'`. Do not widen `save` for that.

`preset` is provenance only. A missing or unknown id still parses.

## Inherited from base

See [base.md](./base.md). Spell progression, spell attack types, and projectiles
stay on the spell adapter.
