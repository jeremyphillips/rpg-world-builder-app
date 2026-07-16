/**
 * Applies structured resolution from spell-seed-resolution.ts into level JSON files.
 * Run from repo root: pnpm exec tsx packages/catalog/scripts/apply-spell-seed-resolution.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { deriveResolutionFromSpell } from '../src/spells/lib/derive-resolution-from-spell.ts'
import { SRD_521_SPELL_SEED_RESOLUTION } from '../src/spells/spell-seed-resolution.ts'
import { SRD_521_SPELL_LEVEL_SEED_FILES } from '../src/spells/spell-level-seed-files.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../src/spells/data/srd-cc-5.2.1')

const levelFiles = SRD_521_SPELL_LEVEL_SEED_FILES

let applied = 0
let stripped = 0

for (const fileName of levelFiles) {
  const filePath = join(dataDir, fileName)
  const spells = JSON.parse(readFileSync(filePath, 'utf8'))
  let changed = false

  for (const spell of spells) {
    const entry = SRD_521_SPELL_SEED_RESOLUTION[spell.slug]
    if (!entry) {
      continue
    }

    if (entry.kind === 'defer') {
      if (spell.resolution !== undefined) {
        delete spell.resolution
        stripped++
        changed = true
      }
      continue
    }

    const resolution =
      entry.kind === 'full' ? entry.resolution : deriveResolutionFromSpell(spell, entry.overrides)

    spell.resolution = structuredClone(resolution)
    applied++
    changed = true
  }

  if (changed) {
    writeFileSync(filePath, `${JSON.stringify(spells, null, 2)}\n`, 'utf8')
  }
}

console.log(`Applied structured resolution to ${applied} spells.`)
if (stripped > 0) {
  console.log(`Stripped resolution from ${stripped} explicitly deferred spells.`)
}
