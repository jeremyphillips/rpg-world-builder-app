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

| Module                              | Responsibility                               |
| ----------------------------------- | -------------------------------------------- |
| `schema.ts`                         | Zod shapes and cross-field validation        |
| `normalize-resolution.ts`           | Legacy `target.proximity.self` normalization |
| `vocab.ts`                          | Closed selection/target vocabularies         |
| `effect-context.ts`                 | Recipient derivation                         |
| `effect-target-compatibility.ts`    | Creature-only effect rules                   |
| `selection-availability.ts`         | Authoring policy                             |
| `format-target.ts`                  | Selection preview sections                   |
| `format-summary.ts`                 | Full resolution preview                      |
| `selection-change-plan.ts`          | Mode-transition cleanup planning             |
| `selection-mode-cleanup.ts`         | Per-mode field clearing rules                |
| `selection-availability.ts`         | Method/pattern availability (targets mode)   |
| `selection-method-compatibility.ts` | Selection × method compatibility matrix      |

## Check method

`attack` | `saving-throw` | `automatic` on `resolution.method`.

### Selection × method compatibility

Authoritative matrix: [`selection-method-compatibility.ts`](../../src/rpg/content/spell/resolution/selection-method-compatibility.ts).

Three states per cell:

| State         | MVP behavior                                                |
| ------------- | ----------------------------------------------------------- |
| `supported`   | Allowed in authoring and schema                             |
| `deferred`    | Blocked — future capability required (distinct reason code) |
| `unsupported` | Blocked — incompatible with current model                   |

| Selection mode     | Attack      | Saving throw | Automatic |
| ------------------ | ----------- | ------------ | --------- |
| `targets`          | supported   | supported    | supported |
| `point`            | deferred    | supported    | supported |
| `self` (no area)   | unsupported | deferred     | supported |
| `self` (with area) | deferred    | supported    | supported |
| `none`             | unsupported | unsupported  | supported |

Deferred and unsupported combinations must not be silently coerced when selection
mode or method changes — incompatible selections surface through change planning.

### Target proximity (targets mode only)

| Method option  | Allowed target proximity (targets mode) |
| -------------- | --------------------------------------- |
| `melee-spell`  | `touch`, `reach`                        |
| `ranged-spell` | `distance`                              |
| `saving-throw` | any external proximity                  |
| `automatic`    | any external proximity                  |

Proximity does not gate method or application pattern when `selectionMode` is
`self`, `point`, or `none`.

## Application patterns

`applicationPattern.kind: 'projectiles'` requires `distance` target proximity in
**targets** mode. Projectile count is independent of `target.count` — darts/beams
are not extra targets.

## Outcomes

Method determines allowed outcome results (`hit`/`miss`, `failed-save`/`successful-save`,
`applied`). Outcomes reference effects by id with `full` | `half` application amounts.

## Atomic effects

Damage, healing, and temporary hit points. Display copy is recipient-aware via
[`deriveEffectRecipientFromResolution`](../../src/rpg/content/spell/resolution/effect-context.ts).

## Selection policy

Availability predicates live in `selection-availability.ts`. Mode-transition
cleanup is planned in `selection-change-plan.ts` and applied on confirm in the
dashboard hook. See [dashboard authoring doc](../../../../apps/dashboard/src/features/content/spells/resolution/docs/authoring.md).

## Explicit gaps (out of MVP)

Documented in catalog [`spell-resolution-targeting-gaps.ts`](../../../../catalog/src/spells/spell-resolution-targeting-gaps.ts):

- Dynamic target counts (Eldritch Blast beams)
- Chosen-within-area subsets
- Target exclusions
- Chained secondary targets (Ice Knife burst)
- Moving aura origins (Darkness object mode)
- Wall/path geometry (Wall of Fire)
- Reaction-implied targets (Hellish Rebuke)
- Multi-mode caster choices (Arcane Hand)
