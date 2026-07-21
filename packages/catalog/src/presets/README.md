# Campaign presets

Campaign presets are product-owned starting points, not rules content. They stay
under this tree even when their `rulesetId` targets the shipped SRD catalog.

## Collections

- `campaign-templates/` contains discoverable campaign-creation defaults.
- `world-seed-packs/` reserves the pipeline for independently versioned world
  content. Its data file is empty and its contract is descriptor-only for now.

Each collection has a validated JSON file and a narrow package export. The
aggregate `@rpg/catalog/presets` export validates collection uniqueness and
template-to-pack references at module load.

## Versioning

Every record has stable `metadata.id` and a semantic `metadata.version`. Increment
the version when shipped authored data or defaults change. Schema changes follow
the repository contracts directly; do not add per-file schema-version transforms
while the project remains dev-only.

When organizations land, extend `worldSeedPackSchema` with a typed contents field
and keep references between seeded records explicit. Do not use an untyped data
bag as an interim format.
