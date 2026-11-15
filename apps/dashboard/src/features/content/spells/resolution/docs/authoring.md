# Spell resolution authoring

Dashboard UI for the spell `resolution` envelope. Normative semantics live in
contracts — do not redefine them here.

- [Effect resolution base](../../../../../../../packages/contracts/docs/effect-resolution/base.md)
- [Spell adapter](../../../../../../../packages/contracts/docs/effect-resolution/spells.md)

## Form modules

| Module                              | Responsibility                     |
| ----------------------------------- | ---------------------------------- |
| `resolution-form-schema.ts`         | Zod shape + selection validation   |
| `resolution-form-values.ts`         | Entity ↔ form round-trip, defaults |
| `resolution-form-visibility.ts`     | Mode-driven field visibility       |
| `resolution-form-slots.ts`          | Slot registry wiring               |
| `spell-outcome-effects-array.ts`    | Outcome list on the shared array   |
| `resolution-target-form-fields.ts`  | Selection panel field definitions  |
| `resolution-progression-*.ts`       | Progression schema slice + presets |
| `spell-resolution-progression.tsx`  | Progression section UI             |
| `use-resolution-change-confirm.tsx` | Confirm-first change planning      |

## Outcome effects

The library stays on `resolution.effects` and is still the definition editor. Each outcome branch mounts `resolutionOutcomeEffectsArray` with the `library` role (`spell-outcome-effects-array.ts`). A row is a reference or a note. **Add applied effect** can create damage, healing, or temporary hit points (definition plus reference), add a note, or apply an existing complete effect. Incomplete effects stay in the menu, disabled, with the completeness reason. Amount choices are Full effect and Half effect. Removing a definition uses the library row's confirm path, which also drops outcome references.

The spell content form, the isolated resolution editor, and the outcome stories use `<TabbedForm>`. That shell keeps structural values. Nested field arrays on `<Form>` (`shouldUnregister: true`) do not.

## Progression section

Placed after **Effects & outcomes**, before preview. Self-contained on the
Resolution tab — no links to Basics-tab scaling prose.

- Empty state: “No progression configured” + **Add progression** (preset menu).
- Presets derive `basis` and track shape from spell level + reference type.
- Cantrip tracks use fixed SRD tiers (5 / 11 / 17); leveled tracks edit increment only.
- Base values are read-only context from the referenced resolution field.

Tests: `resolution-progression-round-trip.test.ts`.

## Selection panel visibility

All mode gating is centralized in `resolution-form-visibility.ts`. Field
definitions compose exported predicates only.

| Field / chrome             | `self` | `targets` | `point` | `none` | Additional rule                        |
| -------------------------- | ------ | --------- | ------- | ------ | -------------------------------------- |
| `selectionMode`            | ✓      | ✓         | ✓       | ✓      | Always visible                         |
| Target fields              | —      | ✓         | —       | —      | Kind, count, proximity                 |
| `countKind`                | —      | ✓         | —       | —      | Hidden when `count === 1`              |
| Proximity distance / reach | —      | ✓         | —       | —      | When proximity is `distance` / `reach` |
| `originDistanceFt`         | —      | —         | ✓       | —      | Required in point mode                 |
| `areaOfEffect`             | ✓      | —         | ✓       | —      | Shape-specific dimensions              |
| Self recipient hint        | ✓      | —         | —       | —      | Only without area                      |
| Self origin hint           | ✓      | —         | —       | —      | Only with area                         |
| Affected-area hint         | ✓\*    | —         | ✓\*     | —      | \*When area present                    |
| None-mode copy             | —      | —         | —       | ✓      | “No target or origin selection”        |

Tests: `resolution-form-visibility.test.ts`.

## Mode-transition cleanup

Cleanup is planned in contracts (`selection-change-plan.ts` /
`selection-mode-cleanup.ts`) and applied on confirm in
`use-resolution-change-confirm.tsx`.

| Transition                  | Cleanup                                                 |
| --------------------------- | ------------------------------------------------------- |
| `targets` → `point`         | Clear target; initialize `origin` from spell range      |
| `point` → `targets`         | Clear `origin` and `areaOfEffect`; `targetCount: 1`     |
| `self` → `none`             | Clear `areaOfEffect`                                    |
| `point` → `self`            | Clear `origin`; preserve compatible `areaOfEffect`      |
| `targets` → `self`          | Clear `target`; preserve `areaOfEffect` if present      |
| `targets` → `none`          | Clear `target`                                          |
| `point` → `none`            | Clear `origin` and `areaOfEffect`                       |
| `self` → `point`            | Initialize `origin`; preserve compatible `areaOfEffect` |
| `areaOfEffect.shape` change | Clear dimensions invalid for new shape                  |

`targets` → `self` no longer flags method/pattern as proximity-incompatible —
proximity gates apply only in **targets** mode. Selection × method compatibility
([`selection-method-compatibility.ts`](../../../../packages/contracts/src/rpg/content/spell/resolution/selection-method-compatibility.ts))
may flag incompatible attack/saving-throw methods without coercing them.

## Change confirm

`requestResolutionChange` plans via `planResolutionChange`. Confirm is required
when incompatible selections, effect removals, or outcome branch discards would
occur. Dialog copy: `resolution-change-dialog.lib.ts`.

## Area geometry

Casting `areaOfEffect` and `resolution.areaOfEffect` share
`areaGeometryFormFields` in `features/content/lib/forms/fields/area-geometry-form-fields.ts`.
Resolution passes its self/point gating through that builder's `visibility`.
The shared contract is `areaGeometrySchema`. Stat-block sentences use
`formatAreaGeometry(area, 'stat-block')` (`15-foot Cone`,
`60-foot-long, 5-foot-wide Line`).

## Round-trip

`resolutionToForm` / `resolutionToStored` must preserve `selectionMode`,
`countKind`, `origin`, and `areaOfEffect`. Tests: `resolution-round-trip.test.ts`.
