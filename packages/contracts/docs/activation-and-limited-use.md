# Activation and limited use

Shared mechanics for how often an ability can be used and what triggers it. Consumers compose these primitives. They do not share one action container.

## Rest

`vocab/rest.ts` defines two rest kinds, `short` and `long`. `REST_KINDS` orders them from least to most complete. That order is code, not stored data.

`restMeetsRecovery` is the only check for whether a rest meets a recovery threshold. A long rest meets a short-rest threshold. Effects that happen when a specific rest finishes, such as a spell-list swap on a long rest, match that rest exactly and do not use `restMeetsRecovery`.

The spell mutation trigger key stays `longRest`. Its label is `REST_KIND_ENTRIES.long.label` (`Long Rest`).

## Limited use

`primitives/limited-use` is one union:

- `uses` — a fixed count or the proficiency bonus, plus a `minimumRest` threshold
- `recharge` — a d6 threshold from 2 through 6

An absent `limitedUse` means the ability has no limit of its own (at will). Recharge also recovers on a short rest via the constant `RECHARGE_REST_RECOVERY`. That recovery is not stored on the recharge object.

`describeLimitedUse` is the only interpreter. Notation and sentences are exhaustive tables. Adding a count kind, rest kind, or notation style is a compile error until every cell is filled. Recharge cannot be passed to `formatLimitedUseSentence`.

Spell grants store only the `uses` variant (`restLimitedUseSchema`). A grant sentence reads `formatLimitedUseSentence`.

## Character entitlements

A free-cast entitlement has one `source` from `grantDerivedSelectionSourceSchema`, so `grantRowId` is required. Entitlement identity is the spell id plus that source. Different grant rows are different pools.

## Trigger

`activationTriggerSchema` is authored eligibility prose: `{ text }`. A future machine-readable event can sit beside `text`.

Spell casting time stores that object on `normal.trigger`. It is required when the unit is `reaction` and rejected for every other unit.

Monster reactions store the same object. An absent trigger means the reaction's trigger is unspecified. Reactions with an authored trigger render as `Trigger:` followed by `Response:`. On a spell reaction, that field is an additional condition. Each referenced reaction spell keeps its own trigger.

## Monster actions

Existing monster kinds and the `spell` kind share one field set. Published and draft schemas differ only in how complete those fields must be. `limitedUse` on an entry is optional. Drafts keep a partial limit. An absent limit means at will.

A `spell` entry references canonical spell ids in `spellGroups`. A limit on the entry is one shared pool. A limit on a group belongs to each spell in that group. An entry cannot have both. `castingAbility.shared` points at another spell entry in the same body that has its own ability. The section is the invoking economy. A spell whose casting time does not match that economy can be saved as a draft and is rejected on publish.

Spell prose is generated from that structure. Weapon attack lines stay derived. Special descriptions stay authored.

## Spell references and grant rows

Persisted spell references are canonical content ids. `resolveSpellReference` is an exact map lookup. Grant rows have stable ids (`grt_<uuid>` when authored, explicit slugs in seeds) that are unique within the owning trait, feature, or heritage option and are never reused.
