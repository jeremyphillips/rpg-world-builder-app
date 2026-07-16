/**
 * Removes legacy root `effects` from spell seed JSON files.
 * Run from repo root: pnpm exec tsx packages/catalog/scripts/strip-spell-root-effects.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SRD_521_SPELL_LEVEL_SEED_FILES } from '../src/spells/spell-level-seed-files.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../src/spells/data/srd-cc-5.2.1')

const levelFiles = SRD_521_SPELL_LEVEL_SEED_FILES

let stripped = 0

for (const fileName of levelFiles) {
  const filePath = join(dataDir, fileName)
  const spells = JSON.parse(readFileSync(filePath, 'utf8'))
  let changed = false

  for (const spell of spells) {
    if ('effects' in spell) {
      delete spell.effects
      stripped++
      changed = true
    }
  }

  if (changed) {
    writeFileSync(filePath, `${JSON.stringify(spells, null, 2)}\n`, 'utf8')
  }
}

console.log(`Stripped root effects from ${stripped} spells.`)
