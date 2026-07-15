# Effect resolution — base framework

Content-type agnostic rules for structured effect resolution envelopes.

## Core invariant: anchor vs recipient

- **`selectionMode`** — what is fixed or chosen at cast time (the anchor).
- **`areaOfEffect`** — when present on the resolution, effects apply to **area
  occupants**, not to the anchor directly.

Recipient-aware copy must use **both** fields. Never infer recipients from
`selectionMode` alone.

| `selectionMode` | `areaOfEffect` | Effect recipient                 |
| --------------- | -------------- | -------------------------------- |
| `self`          | absent         | `self` (caster)                  |
| `self`          | present        | `area` (caster-origin occupants) |
| `point`         | present        | `area` (chosen-point occupants)  |
| `point`         | absent         | `generic`                        |
| `targets`       | absent         | `target`                         |
| `none`          | absent         | `generic`                        |

Implementation: [`deriveEffectRecipientFromResolution`](../../src/rpg/content/spell/resolution/effect-context.ts).

## Selection modes

| Mode      | Anchor meaning                                                      |
| --------- | ------------------------------------------------------------------- |
| `self`    | Caster is the fixed selection/origin — **not always the recipient** |
| `targets` | Caster selects creatures/objects (fixed cardinality)                |
| `point`   | Caster selects an origin point within range                         |
| `none`    | No selection step                                                   |

## Target cardinality

`target.count` + optional `target.countKind` (`exact` | `up-to`).

When `countKind` is omitted: `count === 1` → `exact`; otherwise → `up-to`.

## Validation (per mode)

| Mode      | Required | Forbidden                          |
| --------- | -------- | ---------------------------------- |
| `targets` | `target` | `origin`, `areaOfEffect`           |
| `point`   | `origin` | `target`                           |
| `self`    | —        | `target`, `origin`                 |
| `none`    | —        | `target`, `origin`, `areaOfEffect` |

`areaOfEffect` is allowed only for `self` and `point`.

Schema: [`spellResolutionSchema`](../../src/rpg/content/spell/resolution/schema.ts).

## Preview sections

| Mode      | Area | Headings                |
| --------- | ---- | ----------------------- |
| `targets` | —    | Target / Targets        |
| `self`    | no   | Recipient               |
| `self`    | yes  | Origin, Area, Affected  |
| `point`   | yes  | Origin, Area, Affected  |
| `none`    | —    | _(omit selection rows)_ |

Formatter: [`formatResolutionSelectionSections`](../../src/rpg/content/spell/resolution/format-target.ts).

## Module index (spell implementation)

| Module                           | Responsibility                               |
| -------------------------------- | -------------------------------------------- |
| `schema.ts`                      | Zod shapes and cross-field validation        |
| `normalize-resolution.ts`        | Legacy `target.proximity.self` normalization |
| `vocab.ts`                       | Closed selection/target vocabularies         |
| `effect-context.ts`              | Recipient derivation                         |
| `effect-target-compatibility.ts` | Creature-only effect rules                   |
| `selection-availability.ts`      | Authoring policy                             |
| `format-target.ts`               | Selection preview sections                   |
| `format-summary.ts`              | Full resolution preview                      |
