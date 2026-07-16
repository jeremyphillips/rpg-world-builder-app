/**
 * Applies human-reviewed modeling metadata from spell-modeling-manifest.ts into level JSON files.
 * Run from repo root: pnpm exec tsx packages/catalog/scripts/apply-spell-modeling-metadata.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SRD_521_SPELL_MODELING_MANIFEST } from '../src/spells/spell-modeling-manifest.ts'
import { SRD_521_SPELL_LEVEL_SEED_FILES } from '../src/spells/spell-level-seed-files.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../src/spells/data/srd-cc-5.2.1')

const levelFiles = SRD_521_SPELL_LEVEL_SEED_FILES

let applied = 0
let stripped = 0
const missingFromManifest = new Set()

for (const fileName of levelFiles) {
  const filePath = join(dataDir, fileName)
  const spells = JSON.parse(readFileSync(filePath, 'utf8'))
  let changed = false

  for (const spell of spells) {
    const entry = SRD_521_SPELL_MODELING_MANIFEST[spell.slug]
    if (!entry) {
      missingFromManifest.add(spell.slug)
      if (spell.modeling !== undefined) {
        delete spell.modeling
        stripped++
        changed = true
      }
      continue
    }

    const nextModeling = structuredClone(entry)
    const current = JSON.stringify(spell.modeling ?? null)
    const next = JSON.stringify(nextModeling)

    if (current !== next) {
      spell.modeling = nextModeling
      applied++
      changed = true
    }
  }

  if (changed) {
    writeFileSync(filePath, `${JSON.stringify(spells, null, 2)}\n`, 'utf8')
  }
}

if (missingFromManifest.size > 0) {
  console.error(
    `Manifest missing ${missingFromManifest.size} seed slug(s): ${[...missingFromManifest].sort().join(', ')}`,
  )
  process.exit(1)
}

console.log(`Applied modeling metadata to ${applied} spells.`)
if (stripped > 0) {
  console.log(`Stripped modeling from ${stripped} spells not in manifest.`)
}
