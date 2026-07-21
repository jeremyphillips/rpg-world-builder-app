/**
 * Catalog JSON Schema manifest — maps generated artifacts to catalog seed paths.
 * Consumed by schema generation (VS Code settings) and parity tests.
 */

export type CatalogSchemaManifestEntry = {
  /** File name under `packages/contracts/generated/`. */
  readonly file: string
  /** Workspace-relative globs for VS Code `json.schemas` `fileMatch`. */
  readonly fileMatch: readonly string[]
  /** When true, schema is embedded only (no direct catalog file mapping). */
  readonly embedded?: boolean
}

const CLASS_SLUG_GLOB =
  '{barbarian,bard,cleric,druid,fighter,monk,paladin,ranger,rogue,sorcerer,warlock,wizard}'

const VOCABULARY_SEED_FILE_GLOBS = [
  'attack-resolution-modes',
  'creature-types',
  'damage-types',
  'edition-presets',
  'senses',
  'spell-schools',
] as const

export const CATALOG_SCHEMA_MANIFEST = [
  {
    file: 'grant-group.schema.json',
    fileMatch: [],
    embedded: true,
  },
  {
    file: 'catalog-species-list.schema.json',
    fileMatch: ['packages/catalog/src/species/data/**/species.json'],
  },
  {
    file: 'catalog-class.schema.json',
    fileMatch: [`packages/catalog/src/classes/data/**/${CLASS_SLUG_GLOB}.json`],
  },
  {
    file: 'catalog-subclass-list.schema.json',
    fileMatch: ['packages/catalog/src/classes/data/**/subclasses.json'],
  },
  {
    file: 'catalog-spell-list.schema.json',
    fileMatch: ['packages/catalog/src/spells/data/**/*.json'],
  },
  {
    file: 'catalog-equipment-list.schema.json',
    fileMatch: ['packages/catalog/src/equipment/data/**/*.json'],
  },
  {
    file: 'catalog-feat-list.schema.json',
    fileMatch: ['packages/catalog/src/feats/data/**/feats.json'],
  },
  {
    file: 'catalog-skill-proficiency-list.schema.json',
    fileMatch: ['packages/catalog/src/skill-proficiencies/data/**/skill-proficiencies.json'],
  },
  {
    file: 'catalog-language-list.schema.json',
    fileMatch: ['packages/catalog/src/vocabulary/data/**/languages.json'],
  },
  {
    file: 'catalog-vocabulary-list.schema.json',
    fileMatch: VOCABULARY_SEED_FILE_GLOBS.map(
      (name) => `packages/catalog/src/vocabulary/data/**/${name}.json`,
    ),
  },
  {
    file: 'catalog-starting-wealth-seed.schema.json',
    fileMatch: ['packages/catalog/src/starting-wealth/data/**/starting-wealth.json'],
  },
  {
    file: 'catalog-xp-progression-seed.schema.json',
    fileMatch: ['packages/catalog/src/xp-progressions/data/**/xp-progressions.json'],
  },
  {
    file: 'catalog-campaign-template-list.schema.json',
    fileMatch: ['packages/catalog/src/presets/campaign-templates/data/campaign-templates.json'],
  },
  {
    file: 'catalog-world-seed-pack-list.schema.json',
    fileMatch: ['packages/catalog/src/presets/world-seed-packs/data/world-seed-packs.json'],
  },
] as const satisfies readonly CatalogSchemaManifestEntry[]

export type CatalogSchemaManifest = typeof CATALOG_SCHEMA_MANIFEST

/** VS Code `json.schemas` entries derived from the manifest (skips embedded-only). */
export function catalogSchemaVsCodeEntries(): {
  fileMatch: string[]
  url: string
}[] {
  return CATALOG_SCHEMA_MANIFEST.filter(
    (entry) => !entry.embedded && entry.fileMatch.length > 0,
  ).map((entry) => ({
    fileMatch: [...entry.fileMatch],
    url: `./packages/contracts/generated/${entry.file}`,
  }))
}
