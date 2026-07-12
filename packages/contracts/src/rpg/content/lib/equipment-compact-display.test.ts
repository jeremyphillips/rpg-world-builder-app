import { describe, expect, it } from 'vitest'

import type { Equipment } from '../equipment'
import {
  buildEquipmentCompactSummary,
  COMPACT_METADATA_LAYOUT,
  joinCompactSegments,
} from './equipment-compact-display'

const dagger = {
  id: 'test:dagger',
  slug: 'dagger',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dagger',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  properties: ['finesse', 'light', 'thrown'],
  mastery: 'nick',
  damage: { kind: 'dice', count: 1, faces: 4 },
  damageType: 'piercing',
} satisfies Equipment

const plateArmor = {
  id: 'test:plate-armor',
  slug: 'plate-armor',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Plate Armor',
  description: '',
  cost: { amount: 1500, currency: 'gp' },
  weight: { value: 65, unit: 'lb' },
  kind: 'armor',
  category: 'heavy',
  baseAc: 18,
  addDexModifier: false,
  stealthDisadvantage: true,
  strengthRequirement: 15,
} satisfies Equipment

const holySymbolAmulet = {
  id: 'test:holy-symbol-amulet',
  slug: 'holy-symbol-amulet',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Amulet',
  description: '',
  cost: { amount: 5, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'spellcasting',
  spellcastingGearKind: 'holy_symbol',
  holySymbolUsage: ['worn', 'held'],
} satisfies Equipment

const bracersOfDefense = {
  id: 'test:bracers-of-defense',
  slug: 'bracers-of-defense',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Bracers of Defense',
  description: '',
  cost: { amount: 0, currency: 'gp' },
  kind: 'magic_item',
  rarity: 'rare',
  requiresAttunement: true,
  magicItemCategory: 'wondrous_item',
} satisfies Equipment

const ridingHorse = {
  id: 'test:riding-horse',
  slug: 'riding-horse',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Riding Horse',
  description: '',
  cost: { amount: 75, currency: 'gp' },
  kind: 'mount',
  speed: { value: 60, unit: 'ft' },
  carryingCapacity: { value: 480, unit: 'lb' },
} satisfies Equipment

describe('equipment-compact-display', () => {
  it('joins compact segments with the shared separator', () => {
    expect(joinCompactSegments('AC 16', undefined, 'Heavy armor')).toBe('AC 16 · Heavy armor')
  })

  it('builds weapon metadata segments', () => {
    expect(buildEquipmentCompactSummary(dagger)).toEqual({
      kindLabel: 'Weapon',
      metadata: ['1d4 Piercing', 'Finesse · Light · Thrown'],
    })
  })

  it('caps armor metadata and prefers restriction over weight', () => {
    expect(buildEquipmentCompactSummary(plateArmor)).toEqual({
      kindLabel: 'Armor',
      metadata: ['AC 18', 'Heavy Armor', 'Str 15 required'],
    })
  })

  it('formats holy symbol spellcasting gear without the parent gear kind', () => {
    expect(buildEquipmentCompactSummary(holySymbolAmulet)).toEqual({
      kindLabel: 'Adventuring Gear',
      metadata: ['Holy Symbol', 'Worn or held'],
    })
  })

  it('builds magic item metadata segments', () => {
    expect(buildEquipmentCompactSummary(bracersOfDefense)).toEqual({
      kindLabel: 'Magic Item',
      metadata: ['Wondrous Item', 'Rare', 'Requires attunement'],
    })
  })

  it('builds mount metadata with speed before carrying capacity', () => {
    expect(buildEquipmentCompactSummary(ridingHorse)).toEqual({
      kindLabel: 'Mount',
      metadata: ['60 ft.', 'Carrying capacity 480 lb'],
    })
  })

  it('exposes per-kind compact layouts', () => {
    expect(COMPACT_METADATA_LAYOUT.weapon?.fields).toEqual(['damage', 'properties'])
    expect(COMPACT_METADATA_LAYOUT.magic_item?.fields).toEqual([
      'magicItemCategory',
      'rarity',
      'attunement',
    ])
  })
})
