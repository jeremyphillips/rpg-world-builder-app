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

`onHit.effects` is an ordered list on those attack kinds: `damage`, `condition`, or `note`. Primary damage stays on the attack. The attack profile resolves damage riders once and carries conditions and notes for the same sentence. They do not change the attack bonus or the damage total. Condition `end` is the shared effect lifetime model ([`effect-end.md`](../primitives/effect-end.md)); `description` is a non-temporal qualification. A note is presentation only.

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

### Save outcomes (v1)

Envelope **`effects`** stores every damage, healing, and temporary-hit-point
definition. Each outcome **`effects`** array is the print order: an
`effect-reference` (`effectId` plus `amount` of `full` or `half`), a
`condition`, or a `note`. `half` is valid only for damage. The same definition
can be full on a failed save and half on a successful save. A list references
a definition at most once. Removing a reference leaves the definition. Deleting
a definition removes every reference to that id. A dangling id is a publish
error. On-hit stays inline `damage`, `condition`, and `note` and does not use
`effect-reference`.

On `failed-save` only, optional **`repeatSave`** carries a second-failure tier
with the same effect union.

`repeatSave.timing` for a new shell is the target’s next turn end. Authors do
not edit timing. `successOnRepeatEndsEffect` defaults to true and is separate
from a condition’s `end`. `eligibilityNote` qualifies when the target may
repeat (for example, only while Restrained). Recurring saves, wake-on-damage,
and other termination rules stay in note effects and must not contradict the
generated one-save transition. An opened shell with an empty second failure is
a valid draft. Publish still requires a meaningful second failure.

Optional outcome **`failed-or-successful-save`** appends a third branch
(Failure or Success) whose prose is a `note` row in `effects`. **`onceUntilNextTurn`**
stays on the action row and prints after the save body. On a save action that
sentence is prefixed with **Failure or Success:**.

## Inherited from base

See [base.md](./base.md). Spell progression, spell attack types, and projectiles
stay on the spell adapter.
