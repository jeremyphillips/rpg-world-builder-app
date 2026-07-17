# Catalog JSON Schema generation

Catalog seed JSON under `packages/catalog/src/**/data/**/*.json` is validated at
load time with Zod schemas in `@rpg/contracts`. For editor completion and inline
validation, committed JSON Schema artifacts live in `packages/contracts/generated/`.

## Tool choice

Use **Zod v4 native** [`z.toJSONSchema()`](https://zod.dev/json-schema) with
`target: 'draft-07'` for VS Code compatibility. Do not use the community
`zod-to-json-schema` package — it targets Zod v3 and is no longer maintained.

## Regenerate

From the repo root:

```bash
pnpm generate:json-schemas
```

CI fails when committed output is stale (`pnpm gate:json-schemas`).

## Mapped artifacts

| Output                              | Zod source                | VS Code `fileMatch`                                    |
| ----------------------------------- | ------------------------- | ------------------------------------------------------ |
| `grant-group.schema.json`           | `grantGroupSchema`        | embedded in species/class schemas                      |
| `catalog-species-list.schema.json`  | `z.array(speciesSchema)`  | `packages/catalog/src/species/data/**/species.json`    |
| `catalog-class.schema.json`         | `classStoredSchema`       | per-class JSON under `classes/data/*/`                 |
| `catalog-subclass-list.schema.json` | `z.array(subclassSchema)` | `packages/catalog/src/classes/data/**/subclasses.json` |

Add `.describe()` on high-friction Zod fields when editor hints need richer copy;
re-run generation after contract changes.

## VS Code

Associations live in [`.vscode/settings.json`](../../../.vscode/settings.json).
Open a mapped catalog JSON file to get completion, hover docs, and validation.
