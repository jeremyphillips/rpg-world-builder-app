/**
 * Generates committed JSON Schema artifacts from `@rpg/contracts` Zod schemas.
 *
 * Tooling: Zod v4 native `z.toJSONSchema()` (draft-07 for VS Code compatibility).
 * Do not add `zod-to-json-schema` — it is unmaintained and incompatible with Zod v4.
 *
 * Run from repo root: `pnpm generate:json-schemas`
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { classStoredSchema, subclassSchema } from '../src/rpg/content/classes/class.ts'
import { equipmentSchema } from '../src/rpg/content/equipment.ts'
import { featSchema } from '../src/rpg/content/feat.ts'
import { grantGroupSchema } from '../src/rpg/content/lib/grants.ts'
import { skillProficiencySchema } from '../src/rpg/content/skill-proficiency.ts'
import { spellSchema } from '../src/rpg/content/spell/body.ts'
import { speciesSchema } from '../src/rpg/content/species.ts'
import { xpProgressionSchema } from '../src/rpg/content/xp-progression.ts'
import { startingWealthRulesSchema } from '../src/rpg/campaign/rules/starting-wealth.ts'
import { languageSeedOptionSchema } from '../src/rpg/vocab/language.ts'
import { vocabularySeedOptionSchema } from '../src/rpg/vocab/vocabulary.ts'
import { CATALOG_SCHEMA_MANIFEST, catalogSchemaVsCodeEntries } from './catalog-schema-manifest.ts'
import { postProcessJsonSchema } from './json-schema-post-process.ts'

import { z } from 'zod'

/** Mirrors `@rpg/catalog/seed-schemas` — kept here to avoid a contracts → catalog dev cycle. */
const startingWealthSeedFileSchema = z
  .array(startingWealthRulesSchema)
  .length(1, 'Each SRD ruleset must ship exactly one starting wealth table')

const xpProgressionSeedFileSchema = z
  .array(xpProgressionSchema)
  .length(1, 'Each SRD ruleset must ship exactly one XP progression')

const ROOT = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(ROOT, '../../..')
const OUT_DIR = join(ROOT, '../generated')
const VSCODE_SETTINGS_PATH = join(REPO_ROOT, '.vscode/settings.json')

type GeneratedSchema = {
  file: string
  schema: z.ZodType
}

const SCHEMAS: GeneratedSchema[] = [
  {
    file: 'grant-group.schema.json',
    schema: grantGroupSchema,
  },
  {
    file: 'catalog-species-list.schema.json',
    schema: z.array(speciesSchema),
  },
  {
    file: 'catalog-class.schema.json',
    schema: classStoredSchema,
  },
  {
    file: 'catalog-subclass-list.schema.json',
    schema: z.array(subclassSchema),
  },
  {
    file: 'catalog-spell-list.schema.json',
    schema: z.array(spellSchema),
  },
  {
    file: 'catalog-equipment-list.schema.json',
    schema: z.array(equipmentSchema),
  },
  {
    file: 'catalog-feat-list.schema.json',
    schema: z.array(featSchema),
  },
  {
    file: 'catalog-skill-proficiency-list.schema.json',
    schema: z.array(skillProficiencySchema),
  },
  {
    file: 'catalog-vocabulary-list.schema.json',
    schema: z.array(vocabularySeedOptionSchema),
  },
  {
    file: 'catalog-language-list.schema.json',
    schema: z.array(languageSeedOptionSchema),
  },
  {
    file: 'catalog-starting-wealth-seed.schema.json',
    schema: startingWealthSeedFileSchema,
  },
  {
    file: 'catalog-xp-progression-seed.schema.json',
    schema: xpProgressionSeedFileSchema,
  },
]

mkdirSync(OUT_DIR, { recursive: true })

for (const { file, schema } of SCHEMAS) {
  const jsonSchema = postProcessJsonSchema(
    z.toJSONSchema(schema, {
      target: 'draft-07',
      reused: 'ref',
    }),
  )
  writeFileSync(join(OUT_DIR, file), `${JSON.stringify(jsonSchema, null, 2)}\n`)
}

writeFileSync(
  join(OUT_DIR, 'catalog-schema-manifest.json'),
  `${JSON.stringify({ schemas: CATALOG_SCHEMA_MANIFEST }, null, 2)}\n`,
)

const vscodeSettings = {
  'json.schemas': catalogSchemaVsCodeEntries(),
}
writeFileSync(VSCODE_SETTINGS_PATH, `${JSON.stringify(vscodeSettings, null, 2)}\n`)

console.log(`Wrote ${SCHEMAS.length} schemas to ${OUT_DIR}`)
console.log(`Wrote catalog-schema-manifest.json`)
console.log(`Updated ${VSCODE_SETTINGS_PATH}`)
