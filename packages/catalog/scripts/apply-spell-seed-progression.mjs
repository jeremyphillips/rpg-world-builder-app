/**
 * Applies structured progression from spell-seed-progression.ts into level JSON files.
 * Run from repo root: pnpm exec tsx packages/catalog/scripts/apply-spell-seed-progression.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SRD_521_SPELL_SEED_PROGRESSION } from '../src/spells/spell-seed-progression.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../src/spells/data/srd-cc-5.2.1')

const levelFiles = [
  'level-0.json',
  'level-1.json',
  'level-2.json',
  'level-3.json',
  'level-4.json',
  'level-5.json',
  'level-6.json',
  'level-7.json',
  'level-8.json',
  'level-9.json',
]

let applied = 0
let stripped = 0

for (const fileName of levelFiles) {
  const filePath = join(dataDir, fileName)
  const spells = JSON.parse(readFileSync(filePath, 'utf8'))
  let changed = false

  for (const spell of spells) {
    const progression = SRD_521_SPELL_SEED_PROGRESSION[spell.slug]
    if (!progression) {
      if (spell.resolution?.progression !== undefined) {
        delete spell.resolution.progression
        stripped++
        changed = true
      }
      continue
    }

    if (!spell.resolution) {
      console.warn(`Skipping progression for ${spell.slug}: no resolution envelope`)
      continue
    }

    spell.resolution.progression = structuredClone(progression)
    applied++
    changed = true
  }

  if (changed) {
    writeFileSync(filePath, `${JSON.stringify(spells, null, 2)}\n`, 'utf8')
  }
}

console.log(`Applied structured progression to ${applied} spells.`)
if (stripped > 0) {
  console.log(`Stripped progression from ${stripped} spells outside the manifest.`)
}
