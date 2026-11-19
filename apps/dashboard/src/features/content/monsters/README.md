# content / monsters

Monsters / stat block entries. Part of the [`content`](../README.md) feature; see
[feature-conventions](../../../../docs/feature-conventions.md) for layout.

## Key paths

| Area                                  | Path                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Form registry                         | [`lib/monster-form-def.ts`](./lib/monster-form-def.ts)                                                                                     |
| Form hub                              | `lib/monster-form-{fields,values,schema,labels,preview}.ts(x)`                                                                             |
| Equipment tab lib                     | [`lib/equipment/`](./lib/equipment/)                                                                                                       |
| Actions tab lib                       | [`lib/actions/`](./lib/actions/)                                                                                                           |
| Action preview builders               | [`lib/actions/previews/`](./lib/actions/previews/) — orchestration hook + pure builders; slots stay under `components/form/slots/actions/` |
| Actions tab UI                        | [`components/form/actions/action-sections.tsx`](./components/form/actions/action-sections.tsx)                                             |
| Weapon action mode audit              | [`docs/weapon-action-modes.md`](./docs/weapon-action-modes.md)                                                                             |
| Statistics tab lib                    | [`lib/statistics/`](./lib/statistics/)                                                                                                     |
| Creature details tab lib              | [`lib/creature-details/`](./lib/creature-details/) (skills, languages, defenses)                                                           |
| Traits tab lib                        | [`lib/traits/`](./lib/traits/)                                                                                                             |
| Registered slot entries               | `components/form/slots/**/*.slot.tsx` — see [Form slots](#form-slots)                                                                      |
| Cross-tab spellcasting                | [`lib/casting/`](./lib/casting/) — shared ability sources; see [action-authoring.md](./docs/action-authoring.md)                           |
| Action authoring map                  | [action-authoring.md](./docs/action-authoring.md) — `actions/{save,spell,legendary,weapon,recharge,…}`                                     |
| Detail read model                     | [`lib/monster-display.ts`](./lib/monster-display.ts)                                                                                       |
| Catalog validation / write gates      | [`docs/catalog-validation.md`](./docs/catalog-validation.md)                                                                               |
| Equipment catalog-item swap (planned) | [`.cursor/plans/monster-equipment-catalog-swap.plan.md`](../../../../.cursor/plans/monster-equipment-catalog-swap.plan.md)                 |

Routes side-effect-import `monster-form-def.ts` in create/edit chunks — see
[code-splitting.md](../../../../docs/code-splitting.md).

## Form slots

Registration (`kind: 'slot'` objects) stays in `lib/**`. Identities and the
baseline-versus-registry uniqueness rule live in
[form-slot-register.md](../../../../docs/form-slot-register.md).

Entry modules live here:

```text
components/form/slots/
  tabs/  shell/  statistics/  creature-details/  creature-forms/
  traits/  restrictions/  actions/  spells/
```

`slots/actions/` includes action-preview entries. Do not add
`components/form/actions/**/*.slot.tsx`. Substantial UI that is not itself the registered render lives under
semantic folders beside `slots/`:

| Concern                                          | Path                                               |
| ------------------------------------------------ | -------------------------------------------------- |
| Tab panels                                       | `statistics/`, `equipment/`, `traits/`, `actions/` |
| Armor body                                       | `statistics/armor-slot.tsx` (not a `.slot.tsx`)    |
| Spell frequency field, picker, entry card        | `spells/`                                          |
| Skill/language parts                             | `creature-details/`                                |
| True form, forms editor, difference presentation | `creature-forms/`                                  |

`slots/creature-forms/forms-shape-shifting.slot.tsx` is the composer. The
publish gate, form-availability control, weapon-proficiency reconciliation,
and spell component requirements are the slot file itself, with no twin.
`castingAbility` is one module with two components. Armor class equipment is
one module with `BodyArmorSlot` and `ShieldSlot`.

No `form/slots/index.ts`. No re-export left at the old path after a move.
