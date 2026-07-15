# Spell resolution authoring

Dashboard UI for the spell `resolution` envelope. Normative semantics live in
contracts — do not redefine them here.

- [Effect resolution base](../../../../../../../packages/contracts/docs/effect-resolution/base.md)
- [Spell adapter](../../../../../../../packages/contracts/docs/effect-resolution/spells.md)

## Form modules

| Module                                     | Responsibility                     |
| ------------------------------------------ | ---------------------------------- |
| `resolution-form-schema.ts`                | Zod shape + selection validation   |
| `resolution-form-values.ts`                | Entity ↔ form round-trip, defaults |
| `resolution-form-visibility.ts`            | Mode-driven field visibility       |
| `resolution-form-slots.ts`                 | Slot registry wiring               |
| `resolution-target-form-fields.ts`         | Selection panel field definitions  |
| `use-resolution-change-confirm.client.tsx` | Confirm-first change planning      |

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
`use-resolution-change-confirm.client.tsx`.

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

## Round-trip

`resolutionToForm` / `resolutionToStored` must preserve `selectionMode`,
`countKind`, `origin`, and `areaOfEffect`. Tests: `resolution-round-trip.test.ts`.
