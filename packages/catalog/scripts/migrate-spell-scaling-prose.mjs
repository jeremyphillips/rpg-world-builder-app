#!/usr/bin/env node
/**
 * One-off migration: extract cantrip/upcast scaling prose from spell descriptions
 * into cantripScaling / higherLevelSlotEffect fields.
 *
 * Usage: node packages/catalog/scripts/migrate-spell-scaling-prose.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../src/spells/data/srd-cc-5.2.1')

const LEVEL_FILES = [
  'level-0.json',
  'level-1.json',
  'level-2.json',
  'level-3.json',
  'level-5.json',
  'level-6.json',
]

const CANTrip_PATTERN = /<p><strong>Cantrip Upgrade\.<\/strong>\s*([\s\S]*?)<\/p>\s*$/i
const HIGHER_LEVEL_PATTERN =
  /<p><strong>Using a Higher-Level Spell Slot\.<\/strong>\s*([\s\S]*?)<\/p>\s*$/i

function migrateSpell(spell) {
  const description = spell.description ?? ''
  let next = { ...spell }

  const cantripMatch = description.match(CANTrip_PATTERN)
  if (cantripMatch) {
    const body = cantripMatch[1].trim()
    next = {
      ...next,
      description: description.slice(0, cantripMatch.index).trim(),
      cantripScaling: `<p>${body}</p>`,
    }
    return next
  }

  const higherLevelMatch = description.match(HIGHER_LEVEL_PATTERN)
  if (higherLevelMatch) {
    const body = higherLevelMatch[1].trim()
    next = {
      ...next,
      description: description.slice(0, higherLevelMatch.index).trim(),
      higherLevelSlotEffect: `<p>${body}</p>`,
    }
    return next
  }

  return next
}

let migratedCount = 0

for (const file of LEVEL_FILES) {
  const path = join(DATA_DIR, file)
  const spells = JSON.parse(readFileSync(path, 'utf8'))
  const migrated = spells.map((spell) => {
    const next = migrateSpell(spell)
    if (next !== spell && (next.cantripScaling || next.higherLevelSlotEffect)) {
      migratedCount++
      return next
    }
    return spell
  })
  writeFileSync(path, `${JSON.stringify(migrated, null, 2)}\n`)
  console.log(`Updated ${file}`)
}

console.log(`Migrated ${migratedCount} spells`)
