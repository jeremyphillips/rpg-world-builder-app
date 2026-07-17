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

import { z } from 'zod'

import { classStoredSchema, subclassSchema } from '../src/rpg/content/classes/class.ts'
import { grantGroupSchema } from '../src/rpg/content/lib/grants.ts'
import { speciesSchema } from '../src/rpg/content/species.ts'

const ROOT = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(ROOT, '../generated')

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
]

mkdirSync(OUT_DIR, { recursive: true })

for (const { file, schema } of SCHEMAS) {
  const jsonSchema = z.toJSONSchema(schema, {
    target: 'draft-07',
    reused: 'ref',
  })
  writeFileSync(join(OUT_DIR, file), `${JSON.stringify(jsonSchema, null, 2)}\n`)
}

console.log(`Wrote ${SCHEMAS.length} schemas to ${OUT_DIR}`)
