# Effect resolution — monster actions

**Status:** `save` actions store `effectResolutionSchema` plus `dcSource`.
Other kinds do not. See [action-architecture.md](../action-architecture.md) and
[monster-stat-blocks.md](../monster-stat-blocks.md).

## Kinds

| Kind                                 | Resolution                                                   |
| ------------------------------------ | ------------------------------------------------------------ |
| `weapon`, `natural-weapon`, `attack` | Attack profile. No envelope                                  |
| `save`                               | Envelope. Method must be `saving-throw`. Damage effects only |
| `multiattack`                        | Steps of `{ count, actionIds }`. Not an envelope             |
| `spell`                              | Referenced spells. Each spell keeps its own resolution       |
| `special`                            | Prose                                                        |

Action economy is the section. `multiattack` is valid only in `actions`.
Legendary actions are not modeled.

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
