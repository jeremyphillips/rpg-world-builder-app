# Creature trait authoring

Shared catalog UI for creature trait templates. Grant editors stay in
[`forms/grants/`](../forms/grants/). Monster preset catalogs stay in
[`monsters/lib/traits/`](../../monsters/lib/traits/).

This folder does not own trait semantics, grant payloads, or a capability
model. Those live in `@rpg/contracts` and `runtime/creature`. Layering:
[runtime-resolution-boundaries.md](../../../../../../../packages/contracts/docs/runtime-resolution-boundaries.md).
Species, class, and feat traits: [content-types.md](../../../../../../../docs/content-types.md#content-traits-custom-vs-grant).

## What is here

| Module                                                                     | Role                                                             |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`creature-trait-template-fields.ts`](./creature-trait-template-fields.ts) | Config and display-override fields for a `kind: 'template'` row  |
| [`creature-trait-add-menu.tsx`](./creature-trait-add-menu.tsx)             | Add menu for template and custom trait rows                      |
| [`outside-water-breath-toggle.tsx`](./outside-water-breath-toggle.tsx)     | Controlled hold-breath-outside-water checkbox (preset parameter) |
| [`outside-water-breath.lib.ts`](./outside-water-breath.lib.ts)             | Duration-present predicate for those optional fields             |

Monster and species template rows both use the template fields. The add menu
lists template ids from the contract registry.

## What is not here

Monster stat-block presets, including `water-breathing`, are a different
schema (`trait-preset-schema`) and a different editor. The preset sentence
and duration bounds stay in contracts. `formatWaterBreathing` stays in
`runtime/creature`.

`amphibious`, `limited-amphibiousness`, `hold-breath`, and `water-breathing`
are separate presets. The monster “Hold breath outside water” control writes
optional `outsideWaterBreathAmount` / `outsideWaterBreathUnit` on the
`water-breathing` row. It does not define the breathing behavior.
`outside-water-breath-toggle.tsx` and `outside-water-breath.lib.ts` are
preset-parameter authoring. They are not a `water-breathing` capability API.
The monster form slot that wires react-hook-form stays under
`monsters/components/form/slots/`.

A source-independent capability, shared by traits, spells, and items, is a
later plan
([creature form-slot plan § L](../../../../../../../.cursor/plans/creature_form_slot_architecture_f1b1d1f5.plan.md)).
Do not add that schema or resolver from this folder.

Registered monster slots are per authoring surface. This folder does not
export slot entries.
