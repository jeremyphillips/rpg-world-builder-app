# Action architecture

Authoring and display only. There is no encounter resolver, turn order, or live
attack roll. Shared math is limited to modifiers, save DC, dice averages, and
stat-block sentences.

## Layers

| Layer           | Home                            | Owns                                                                                                                        |
| --------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Primitives      | `rpg/primitives/`               | Rolls, area geometry, limited use                                                                                           |
| Closed sets     | `rpg/vocab/resolution/`         | Selection modes, target kinds, proximity, outcomes, application amounts, method kinds                                       |
| Envelope        | `rpg/content/lib/resolution/`   | `effectResolutionSchema` — selection, method (`saving-throw` \| `automatic`), damage/healing/temporary hit points, outcomes |
| Spell adapter   | `rpg/content/spell/resolution/` | Spell attack methods, projectile pattern, progression. `spellResolutionSchema` spreads the envelope                         |
| Monster actions | `rpg/content/monster/action.ts` | Kind union, `dcSource`, multiattack steps, optional `preset` and natural `form`                                             |
| Stat block      | `rpg/runtime/monster/`          | Attack lines, `formatMonsterSaveAction`, `formatMonsterMultiattack`                                                         |

Save DC is `abilitySaveDc` in `rpg/runtime/creature/spell-dc.ts` (8 + proficiency
bonus + ability modifier). Area sentences for stat blocks use
`formatAreaGeometry(area, 'stat-block')`.

## Monster action kinds

`weapon`, `natural-weapon`, `attack`, `save`, `multiattack`, `special`, and
`spell`. The section (`actions`, `bonusActions`, `reactions`) is the action
economy. `multiattack` is valid only in `actions`. Reactions omit that kind.

`preset` is an optional string stored on the action. It records where the row
was created. Parsing does not require the id to exist in a registry, and nothing
reapplies preset defaults after creation.

`form` on a natural weapon is anatomy (`bite`, `claw`, `slam`, `gore`, `ram`,
`sting`, `tail`, `tentacle`, `talons`). It is optional and independent of
`preset`.

A shared action-vocabulary map and a preset registry are not in contracts yet.
Natural-weapon menu defaults still come from `vocab/monster-natural-weapon-preset.ts`.
Core action names (Attack, Grapple, Dash, and the rest) are not rules. Adding a
vocabulary entry must not imply a mechanic.

## `save`

A `save` action stores `dcSource` and a full `effectResolutionSchema`.

Published saves accept only:

- `method.kind` `saving-throw` (`automatic` is rejected)
- `selectionMode` `self` with `areaOfEffect`, or `targets` with `target.kind`
  `creature` and proximity `reach` or `distance`
- damage effects
- outcomes `failed-save` and optional `successful-save`

`dcSource` reuses the monster ability source also used by `attack.bonusSource`:
an ability plus a proficiency flag, or a spellcasting entry. The printed DC is
derived, not stored.

`formatMonsterSaveAction` prints the SRD line (ability, DC, area or target,
failure, success). Hell Hound Fire Breath is the seed example.

Automatic effects (a no-check aura, for example) are not `save` actions. A later
kind can attach the same `effectResolutionSchema` with `method.kind: 'automatic'`.
That kind is not implemented.

## `multiattack`

`steps` are `{ count, actionIds }`. Several ids in one step mean "in any
combination." Extra clauses stay in `description` and are appended after the
generated sentence.

Each id must be an action in `actions` whose kind is `weapon`, `natural-weapon`,
or `attack`. Dangling ids, other kinds, self-reference, and repeated ids are
errors. Draft mode reports broken references. Empty steps are a publish error.

`formatMonsterMultiattack` builds the sentence from the monster name and resolved
action names. Weapon names come from the equipment catalog.

## Not in this model

Available-actions resolver, encounter picker, action grants, legendary actions,
and a structured condition effect. Grappled or restrained text on a save stays
in an outcome `note` until a condition effect exists on the envelope.
