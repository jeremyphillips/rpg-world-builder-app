# Action architecture

Authoring and display only. There is no encounter resolver, turn order, or live
attack roll. Shared math is limited to modifiers, save DC, dice averages, and
stat-block sentences.

## Layers

| Layer           | Home                            | Owns                                                                                                                                                           |
| --------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitives      | `rpg/primitives/`               | Rolls, area geometry, limited use                                                                                                                              |
| Closed sets     | `rpg/vocab/resolution/`         | Selection modes, target kinds, proximity, outcomes, application amounts, method kinds                                                                          |
| Envelope        | `rpg/content/lib/resolution/`   | `effectResolutionSchema` — selection, method (`saving-throw` \| `automatic`), damage/healing/temporary hit points, outcomes                                    |
| Spell adapter   | `rpg/content/spell/resolution/` | Spell attack methods, projectile pattern, progression. `spellResolutionSchema` spreads the envelope                                                            |
| Monster actions | `rpg/content/monster/action.ts` | Kind union, section eligibility, `dcSource`, multiattack steps, `action-reference`, reaction `parry`, optional `preset` and natural `form`                     |
| Stat block      | `rpg/runtime/monster/`          | Attack lines, `formatMonsterSaveAction`, `formatMonsterMultiattack`, `formatMonsterActionReference`, `formatMonsterParryTrigger`, `formatMonsterParryResponse` |

Save DC is `abilitySaveDc` in `rpg/runtime/creature/spell-dc.ts` (8 + proficiency
bonus + ability modifier). Area sentences for stat blocks use
`formatAreaGeometry(area, 'stat-block')`.

## Monster action kinds

`weapon`, `natural-weapon`, `attack`, `save`, `multiattack`, `special`,
`spell`, `action-reference`, and `parry`. Which kinds a section accepts is
`MONSTER_SECTION_KINDS`. Actions keep the attack, save, spell, special, and
multiattack kinds. Bonus Actions keep `attack`, `save`, `spell`, and `special`.
Reactions keep `parry`, `action-reference`, `spell`, and `special`. Legendary
Actions keep `action-reference`, `spell`, and `special`. `multiattack` is valid
only in `actions`. Breath Weapon and Constrict presets are Actions presets even
though they store `kind: 'save'`. Rows do not move into or out of Legendary
Actions, and a row cannot move into a section that does not allow its kind.

`action-reference` points at Actions rows by id. A legendary reference may list
several attacks, and the creature makes one of them. One id may be an attack, a
save, or a special ability. Optional legendary `movement.allowance` is
`half-speed` or `speed`. A reaction reference stores exactly one id, an authored
trigger, and optional additional rules. It has no movement. `parry` stores an
AC bonus and an optional follow-up attack id. Its trigger and response are
generated from the current creature name. An unresolved reference id is not
printed. Legendary actions spend one use from `legendaryActionUses`. An
optional `legendaryActionUsesInLair` is printed only when it is greater than
that pool. There is no per-option cost.
`onceUntilNextTurn` prints one restriction sentence and is not `limitedUse`.
`spellInvocation: 'use-entry'` is stored only on a legendary spell row and
points at one spell on a shared spellcasting action. Omitting it shares only
that action's ability, and the spell does not have to be on a list. A legendary
spell row has exactly one spell. This remains authoring and display. It does
not track spent uses.

`preset` is an optional string stored on the action. It records which preset
created the row and remains the live source of that row's default name.
Parsing requires a known preset id on publish. Copied mechanics (damage, form,
reach, resolution, and the rest) are not reapplied after creation. `form` is
anatomy, not a name.

`form` on a natural weapon is anatomy (`bite`, `claw`, `slam`, `gore`, `ram`,
`sting`, `tail`, `tentacle`, `talons`). It is optional and independent of
`preset`.

Action identity and add-menu defaults live in
`vocab/action/action-vocabulary.ts` and `content/action/action-presets.ts`.
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

## Creature trait templates

Trait mechanics are not action presets. `content/creature/traits` keeps a
versioned registry (`CREATURE_TRAIT_TEMPLATE_ENTRIES`). A species or monster
row stores `templateId`, optional config, and display overrides. Reading the
row resolves grants from the registry. Nothing copies those mechanics into the
row, and a later edit of config does not rewrite the registry.

Action `preset` stays authoring provenance only. It still does not reapply
defaults after creation.

## Not in this model

Available-actions resolver, encounter picker, action grants, variable legendary
costs, movement execution, and a structured condition effect. Grappled or
restrained text on a save stays
in an outcome `note` until a condition effect exists on the envelope.
