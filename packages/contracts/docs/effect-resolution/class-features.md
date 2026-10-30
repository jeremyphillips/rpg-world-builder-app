# Effect resolution — class features

**Status:** stub — class features are prose + grants today.

## Expected attachment (TBD)

`features[].resolution` on [`classFeatureSchema`](../../src/rpg/content/classes/class.ts).

## Inherited from base

Selection modes, method, outcomes, and recipient derivation — see [base.md](./base.md).

## Expected deltas

- No spell slot level or spell `range` metadata.
- Many features may use `selectionMode: 'none'` for passive grants.
- Class and species features do not store activation or limited use yet. Those primitives exist for grants, spells, and monster actions. Feature adoption is documented only.
