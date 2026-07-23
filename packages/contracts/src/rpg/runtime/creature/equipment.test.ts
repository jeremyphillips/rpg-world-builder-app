import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../content/equipment'
import {
  isEquipmentPoolFullyAvailable,
  isGrantedEquipmentAvailable,
  listEquipmentMatchingPool,
  toEquipmentContentId,
  type CreatureEquipmentCatalog,
} from './equipment'

const RULESET = 'srd-cc-5.2.1' as const

const leatherArmor = equipmentSchema.parse({
  id: `${RULESET}:leather-armor`,
  slug: 'leather-armor',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Leather Armor',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 10, unit: 'lb' },
  kind: 'armor',
  category: 'light',
  baseAc: 11,
  addDexModifier: true,
  stealthDisadvantage: false,
})

const thievesTools = equipmentSchema.parse({
  id: `${RULESET}:thieves-tools`,
  slug: 'thieves-tools',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: "Thieves' Tools",
  description: '',
  cost: { amount: 25, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'thieves',
  ability: 'dex',
  utilizes: [{ description: 'Pick a lock', dc: 15 }],
})

const lute = equipmentSchema.parse({
  id: `${RULESET}:lute`,
  slug: 'lute',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Lute',
  description: '',
  cost: { amount: 35, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play a known tune', dc: 10 }],
})

function equipmentCatalog(items: (typeof leatherArmor)[]): CreatureEquipmentCatalog {
  return new Map(items.map((item) => [item.id, item]))
}

describe('toEquipmentContentId', () => {
  it('returns opaque catalog ids unchanged', () => {
    expect(toEquipmentContentId(RULESET, `${RULESET}:leather-armor`)).toBe(
      `${RULESET}:leather-armor`,
    )
  })

  it('resolves bare slugs to ruleset-scoped content ids', () => {
    expect(toEquipmentContentId(RULESET, 'leather-armor')).toBe(`${RULESET}:leather-armor`)
  })
})

describe('listEquipmentMatchingPool', () => {
  const catalog = equipmentCatalog([leatherArmor, thievesTools, lute])

  it('resolves explicit pool slugs to catalog rows', () => {
    expect(
      listEquipmentMatchingPool({
        pool: { source: 'explicit', equipmentSlugs: ['leather-armor', 'thieves-tools'] },
        equipment: catalog,
        rulesetId: RULESET,
      }),
    ).toEqual([leatherArmor, thievesTools])
  })

  it('ignores unknown explicit slugs', () => {
    expect(
      listEquipmentMatchingPool({
        pool: { source: 'explicit', equipmentSlugs: ['leather-armor', 'missing-item'] },
        equipment: catalog,
        rulesetId: RULESET,
      }),
    ).toEqual([leatherArmor])
  })

  it('filters tools by category', () => {
    expect(
      listEquipmentMatchingPool({
        pool: { source: 'filtered', equipmentKind: 'tool', toolCategory: 'thieves' },
        equipment: catalog,
        rulesetId: RULESET,
      }),
    ).toEqual([thievesTools])
  })

  it('filters armor by category', () => {
    expect(
      listEquipmentMatchingPool({
        pool: { source: 'filtered', equipmentKind: 'armor', armorCategory: 'light' },
        equipment: catalog,
        rulesetId: RULESET,
      }),
    ).toEqual([leatherArmor])
  })

  it('returns empty when filtered pool has no matches', () => {
    expect(
      listEquipmentMatchingPool({
        pool: { source: 'filtered', equipmentKind: 'weapon', weaponCategory: 'martial' },
        equipment: catalog,
        rulesetId: RULESET,
      }),
    ).toEqual([])
  })
})

describe('isEquipmentPoolFullyAvailable', () => {
  const catalog = equipmentCatalog([leatherArmor, thievesTools])

  it('returns true when every explicit slug resolves', () => {
    expect(
      isEquipmentPoolFullyAvailable({
        pool: { source: 'explicit', equipmentSlugs: ['leather-armor', 'thieves-tools'] },
        equipment: catalog,
        rulesetId: RULESET,
      }),
    ).toBe(true)
  })

  it('returns false when an explicit slug is missing from the catalog', () => {
    expect(
      isEquipmentPoolFullyAvailable({
        pool: { source: 'explicit', equipmentSlugs: ['leather-armor', 'missing-item'] },
        equipment: catalog,
        rulesetId: RULESET,
      }),
    ).toBe(false)
  })

  it('returns true when a filtered pool has at least one match', () => {
    expect(
      isEquipmentPoolFullyAvailable({
        pool: { source: 'filtered', equipmentKind: 'tool', toolCategory: 'thieves' },
        equipment: catalog,
        rulesetId: RULESET,
      }),
    ).toBe(true)
  })

  it('returns false when a filtered pool has no matches', () => {
    expect(
      isEquipmentPoolFullyAvailable({
        pool: { source: 'filtered', equipmentKind: 'weapon', weaponCategory: 'martial' },
        equipment: catalog,
        rulesetId: RULESET,
      }),
    ).toBe(false)
  })
})

describe('isGrantedEquipmentAvailable', () => {
  const catalog = equipmentCatalog([leatherArmor])

  it('returns true when the granted slug resolves in the catalog', () => {
    expect(
      isGrantedEquipmentAvailable({
        rulesetId: RULESET,
        equipmentSlug: 'leather-armor',
        equipment: catalog,
      }),
    ).toBe(true)
  })

  it('returns false when the granted slug is missing from the catalog', () => {
    expect(
      isGrantedEquipmentAvailable({
        rulesetId: RULESET,
        equipmentSlug: 'missing-item',
        equipment: catalog,
      }),
    ).toBe(false)
  })
})
