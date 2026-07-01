# Testing in @rpg/contracts

Campaign ruleset work spans validation, merge/resolver logic, and cross-field
refinements. Tests are split by **layer ownership** so each package asserts
what it owns — not the full stack.

## Test pyramid

| Layer               | Owns                                               | Example                                            |
| ------------------- | -------------------------------------------------- | -------------------------------------------------- |
| Primitives          | Level-range table messages, overlap/gap/end-at-max | `level-range-table.test.ts`                        |
| Campaign rules      | Starting wealth merge, sparse diff, tier lookup    | `starting-wealth.test.ts`                          |
| Campaign patches    | Resolve defaults, happy-path merge                 | `campaign-character-creation-patch.test.ts`        |
| Validation matrices | Cross-field `safeParse*` / request-body rules      | `*-validation.test.ts`                             |
| Catalog             | Real SRD seed ids + JSON shape                     | `@rpg/catalog` `*.test.ts`                         |
| API                 | Mongo sparse persist, HTTP wire shape              | `apps/api` `*.service.test.ts`, `*.routes.test.ts` |

Put combinatorial validation in **contracts** — not in API integration tests.

## Shared test scaffold (`src/test/`)

| Path                                   | Purpose                                                 |
| -------------------------------------- | ------------------------------------------------------- |
| `fixtures/starting-wealth-minimal.ts`  | Synthetic tier ids (`tier-a`, …) — never catalog ids    |
| `fixtures/character-creation-patch.ts` | `baseCharacterCreationPatch`, `extendedProgressionAt()` |
| `helpers/expect-zod-result.ts`         | `expectParseSuccess`, `expectParseFailure`              |
| `helpers/patch-tier.ts`                | `withLastTierMaxLevel`, `patchTierById`                 |
| `helpers/parse-with-refine.ts`         | `parseWithRefine` for level-range table tests           |
| `scenarios/character-creation.ts`      | Named patch **input shapes** for matrices               |

Import shared helpers from co-located tests via relative paths, e.g.
`../../../test/fixtures/starting-wealth-minimal`.

## Fixture id policy

- **Contracts** — synthetic ids only (`tier-a`, `tier-b`). Never `initiate`, `level-1`, or other catalog ids.
- **Catalog / API / dashboard** — derive tier ids from `@rpg/catalog/starting-wealth/test-fixtures` or `getStandardStartingWealthRules()`.

Contracts tests must **not** import `@rpg/catalog`. Catalog alignment is tested in `@rpg/catalog` and `apps/api`.

## When to use `it.each` vs co-located `it()`

- **Co-located `it()`** — single happy paths, resolver defaults, one-off merge behaviour.
- **`it.each` matrices** — cross-field validation with multiple input/expected pairs (extended max vs tier coverage, starting level vs effective max, gapped tiers in request body).

Keep matrices in dedicated `*-validation.test.ts` files only — not mixed into resolver tests.

## File naming

| Pattern                       | Use                                      |
| ----------------------------- | ---------------------------------------- |
| `{module}.test.ts`            | Default co-located schema/resolver tests |
| `{module}-validation.test.ts` | Cross-field `it.each` matrices only      |

## Scripts

```sh
pnpm --filter @rpg/contracts test
pnpm --filter @rpg/contracts typecheck
```
