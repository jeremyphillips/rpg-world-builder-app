/**
 * Applies structured effects from spell-seed-effects.ts into level JSON files.
 * Run from repo root: pnpm exec tsx packages/catalog/scripts/apply-spell-seed-effects.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SRD_521_SPELL_SEED_EFFECTS } from '../src/spells/spell-seed-effects.ts'

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

for (const fileName of levelFiles) {
  const filePath = join(dataDir, fileName)
  const spells = JSON.parse(readFileSync(filePath, 'utf8'))
  let changed = false

  for (const spell of spells) {
    const effects = SRD_521_SPELL_SEED_EFFECTS[spell.slug]
    if (effects) {
      spell.effects = structuredClone(effects)
      applied++
      changed = true
    } else if ('effects' in spell) {
      delete spell.effects
      changed = true
    }
  }

  if (changed) {
    writeFileSync(filePath, `${JSON.stringify(spells, null, 2)}\n`, 'utf8')
  }
}

console.log(`Applied structured effects to ${applied} spells.`)
