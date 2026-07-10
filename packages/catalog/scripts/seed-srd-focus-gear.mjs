/**
 * Adds SRD 5.2.1 spellcasting focus items and spellbook to adventuring_gear.json.
 * Run: node packages/catalog/scripts/seed-srd-focus-gear.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, '../src/equipment/data/srd-cc-5.2.1/adventuring_gear.json')
const RULESET = 'srd-cc-5.2.1'
const TS = '2024-05-21T00:00:00.000Z'

const gp = (amount) => ({ amount, currency: 'gp' })
const lb = (value) => ({ value, unit: 'lb' })

const SPELLCASTING_SUB_KINDS = new Set([
  'arcane_focus',
  'druidic_focus',
  'holy_symbol',
  'spellbook',
])

function gear(slug, name, description, cost, spellcastingGearKind, { weight, ...extra } = {}) {
  return {
    id: `${RULESET}:${slug}`,
    slug,
    rulesetId: RULESET,
    source: 'system',
    campaignId: null,
    createdAt: TS,
    updatedAt: TS,
    name,
    description,
    cost,
    kind: 'adventuring_gear',
    gearKind: 'spellcasting',
    spellcastingGearKind,
    ...(weight !== undefined && { weight }),
    ...extra,
  }
}

const NEW_ITEMS = [
  gear('arcane-staff', 'Staff', '', gp(5), 'arcane_focus', {
    weight: lb(4),
    alsoWeaponSlug: 'quarterstaff',
  }),
  gear('crystal', 'Crystal', '', gp(10), 'arcane_focus', { weight: lb(1) }),
  gear('holy-symbol-amulet', 'Amulet', '', gp(5), 'holy_symbol', {
    weight: lb(1),
    holySymbolUsage: ['worn', 'held'],
  }),
  gear('holy-symbol-emblem', 'Emblem', '', gp(5), 'holy_symbol', {
    holySymbolUsage: ['borne_on_fabric', 'borne_on_shield'],
  }),
  gear('holy-symbol-reliquary', 'Reliquary', '', gp(5), 'holy_symbol', {
    weight: lb(2),
    holySymbolUsage: ['held'],
  }),
  gear('rod', 'Rod', '', gp(10), 'arcane_focus', { weight: lb(2) }),
  gear(
    'spellbook',
    'Spellbook',
    'A leather-bound tome with one hundred blank vellum pages used to record and prepare spells.',
    gp(50),
    'spellbook',
    { weight: lb(3) },
  ),
  gear('sprig-of-mistletoe', 'Sprig of Mistletoe', '', gp(1), 'druidic_focus'),
  gear('wooden-staff', 'Wooden Staff', '', gp(5), 'druidic_focus', {
    weight: lb(4),
    alsoWeaponSlug: 'quarterstaff',
  }),
  gear('yew-wand', 'Yew Wand', '', gp(10), 'druidic_focus', { weight: lb(1) }),
]

const existing = JSON.parse(readFileSync(DATA_FILE, 'utf8'))
const bySlug = new Map(existing.map((item) => [item.slug, item]))

for (const item of NEW_ITEMS) {
  bySlug.set(item.slug, item)
}

for (const slug of ['orb', 'wand']) {
  const item = bySlug.get(slug)
  if (item) {
    bySlug.set(slug, { ...item, description: '' })
  }
}

const merged = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug))
writeFileSync(DATA_FILE, `${JSON.stringify(merged, null, 2)}\n`)
console.log(`Wrote ${merged.length} adventuring gear records`)
