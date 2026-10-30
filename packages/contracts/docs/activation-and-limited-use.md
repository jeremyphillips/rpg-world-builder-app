# Activation and limited use

Shared mechanics for how often an ability can be used, and later for what triggers it. Consumers compose these primitives. They do not share one action container.

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

## Spell references and grant rows

Persisted spell references are canonical content ids. `resolveSpellReference` is an exact map lookup. Grant rows have stable ids (`grt_<uuid>` when authored, explicit slugs in seeds) that are unique within the owning trait, feature, or heritage option and are never reused.
