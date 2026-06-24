import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { z } from 'zod'
import { equipmentSchema } from '@rpg/contracts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(root, relativePath), 'utf8'))
}

const GEAR_CATEGORY_TO_KIND: Record<string, string> = {
  container: 'container',
  consumable: 'consumable',
  lighting: 'general',
  writing: 'general',
  kit: 'general',
  other: 'general',
}

const FOCUS_TYPE_TO_GEAR_KIND: Record<string, string> = {
  arcane: 'arcane_focus',
  druidic: 'druidic_focus',
  holy: 'holy_symbol',
}

const TOOL_CATEGORY_MAP: Record<string, string> = {
  artisan: 'artisan',
  'gaming-set': 'gaming_set',
  'musical-instrument': 'musical_instrument',
  other: 'other',
}

function transformLegacyEquipment(record: Record<string, unknown>): Record<string, unknown> {
  const kind = record['kind']
  const { gearCategory, focusType, toolCategory, notes, ...rest } = record

  switch (kind) {
    case 'gear': {
      const category = typeof gearCategory === 'string' ? gearCategory : 'other'
      const gearKind = GEAR_CATEGORY_TO_KIND[category] ?? 'general'
      const next: Record<string, unknown> = { ...rest, kind: 'adventuring_gear', gearKind }
      if (record['slug'] === 'torch') {
        next['properties'] = ['1-hour duration']
      }
      return next
    }
    case 'ammunition':
      return {
        ...rest,
        kind: 'adventuring_gear',
        gearKind: 'ammunition',
        bundleSize: record['bundleSize'],
        storage: record['storage'],
      }
    case 'focus': {
      const focus = typeof focusType === 'string' ? focusType : 'arcane'
      return {
        ...rest,
        kind: 'adventuring_gear',
        gearKind: FOCUS_TYPE_TO_GEAR_KIND[focus] ?? 'arcane_focus',
      }
    }
    case 'tool': {
      const slug = record['slug']
      const rawCategory = typeof toolCategory === 'string' ? toolCategory : 'other'
      let mappedCategory = TOOL_CATEGORY_MAP[rawCategory] ?? rawCategory
      if (slug === 'thieves-tools') mappedCategory = 'thieves'
      return { ...rest, kind: 'tool', toolCategory: mappedCategory }
    }
    case 'mount':
      return { ...rest, kind: 'mount' }
    case 'vehicle':
      return { ...rest, kind: 'vehicle', vehicleCategory: 'land' }
    case 'ship': {
      const next: Record<string, unknown> = { ...rest, kind: 'vehicle', vehicleCategory: 'water' }
      for (const key of [
        'speed',
        'crew',
        'passengers',
        'cargoTons',
        'ac',
        'hp',
        'damageThreshold',
      ] as const) {
        if (record[key] !== undefined) next[key] = record[key]
      }
      return next
    }
    case 'misc':
      return {
        ...rest,
        kind: 'service',
        serviceCategory: record['slug'] === 'stabling' ? 'stable' : 'other',
        ...(typeof notes === 'string' ? { notes } : {}),
      }
    default:
      throw new Error(`Unknown legacy kind: ${String(kind)}`)
  }
}

const META = {
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
} as const

const NEW_ENTRIES = [
  {
    ...META,
    id: 'srd-cc-5.2.1:bracers-of-defense',
    slug: 'bracers-of-defense',
    kind: 'magic_item',
    name: 'Bracers of Defense',
    description:
      '<p>While wearing these bracers, you gain a +2 bonus to Armor Class if you are wearing no armor and using no shield.</p>',
    cost: { amount: 0, currency: 'gp' },
    rarity: 'rare',
    requiresAttunement: true,
    magicItemCategory: 'wondrous_item',
  },
  {
    ...META,
    id: 'srd-cc-5.2.1:skilled-hireling',
    slug: 'skilled-hireling',
    kind: 'service',
    name: 'Skilled Hireling',
    description:
      '<p>A skilled hireling performs a service involving a proficiency, such as a mercenary, artisan, or scribe.</p>',
    cost: { amount: 2, currency: 'gp' },
    serviceCategory: 'hireling',
    duration: 'per day',
  },
  {
    ...META,
    id: 'srd-cc-5.2.1:untrained-hireling',
    slug: 'untrained-hireling',
    kind: 'service',
    name: 'Untrained Hireling',
    description:
      '<p>An untrained hireling performs manual labor that requires no particular proficiencies, such as a laborer or porter.</p>',
    cost: { amount: 2, currency: 'sp' },
    serviceCategory: 'hireling',
    duration: 'per day',
  },
  {
    ...META,
    id: 'srd-cc-5.2.1:messenger',
    slug: 'messenger',
    kind: 'service',
    name: 'Messenger',
    description: '<p>A messenger carries a letter or parcel overland.</p>',
    cost: { amount: 2, currency: 'cp' },
    serviceCategory: 'travel',
    duration: 'per mile',
  },
]

const equipmentRaw = readJson('src/equipment/data/srd-cc-5.2.1/equipment.json') as Record<
  string,
  unknown
>[]
const weaponsRaw = readJson('src/weapons/data/srd-cc-5.2.1/weapons.json') as Record<
  string,
  unknown
>[]
const armorRaw = readJson('src/armor/data/srd-cc-5.2.1/armor.json') as Record<string, unknown>[]

const merged = [
  ...weaponsRaw.map((record) => ({ ...record, kind: 'weapon' })),
  ...armorRaw.map((record) => ({ ...record, kind: 'armor' })),
  ...equipmentRaw.map(transformLegacyEquipment),
  ...NEW_ENTRIES,
].sort((a, b) => String(a['slug']).localeCompare(String(b['slug'])))

const parsed = z.array(equipmentSchema).parse(merged)

const outPath = join(root, 'src/equipment/data/srd-cc-5.2.1/equipment.json')
writeFileSync(outPath, `${JSON.stringify(parsed, null, 2)}\n`)

console.log(`Wrote ${parsed.length} equipment records`)
