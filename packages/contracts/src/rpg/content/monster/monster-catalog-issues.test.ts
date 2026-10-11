import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../equipment'
import { collectMonsterCatalogIssues, MONSTER_CATALOG_ISSUE_CODE } from './monster-catalog-issues'

const RULESET = 'srd-cc-5.2.1'

function armor(slug: string, name: string) {
  return equipmentSchema.parse({
    id: `${RULESET}:${slug}`,
    slug,
    rulesetId: RULESET,
    source: 'system',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name,
    description: '',
    cost: { amount: 1, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    kind: 'armor',
    category: 'light',
    baseAc: 11,
    addDexModifier: true,
    stealthDisadvantage: false,
  })
}

const dagger = equipmentSchema.parse({
  id: `${RULESET}:dagger`,
  slug: 'dagger',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dagger',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  properties: [],
  mastery: 'nick',
  damage: { dice: { count: 1, faces: 4 } },
  damageType: 'piercing',
})

const leather = armor('leather', 'Leather')
const chain = armor('chain-shirt', 'Chain Shirt')
const catalogs = { equipmentById: new Map([dagger, leather, chain].map((item) => [item.id, item])) }

describe('collectMonsterCatalogIssues', () => {
  it('blocks unknown equipment, non-weapon actions, and armor modifiers on every intent', () => {
    const issues = collectMonsterCatalogIssues(
      {
        armorClass: { kind: 'unarmored' },
        equipment: [
          { entryId: 'missing', equipmentId: 'nope', equipped: true },
          { entryId: 'leather', equipmentId: leather.id, equipped: true },
          {
            entryId: 'dagger',
            equipmentId: dagger.id,
            modifiers: [{ kind: 'armor_class', bonus: 1 }],
          },
        ],
        reactions: [{ kind: 'weapon', equipmentEntryId: 'leather' }],
      },
      catalogs,
      'draft',
    )
    expect(issues.map((issue) => issue.code)).toEqual([
      MONSTER_CATALOG_ISSUE_CODE.unknownEquipment,
      MONSTER_CATALOG_ISSUE_CODE.armorClassModifierNotArmor,
      MONSTER_CATALOG_ISSUE_CODE.weaponActionNotWeapon,
    ])
    expect(issues.map((issue) => issue.path)).toEqual([
      'equipment.0.equipmentId',
      'equipment.2.modifiers',
      'reactions.0.equipmentEntryId',
    ])
  })

  it('blocks a second equipped body armor and accepts unequipped weapon references', () => {
    const issues = collectMonsterCatalogIssues(
      {
        armorClass: { kind: 'natural' },
        equipment: [
          { entryId: 'leather', equipmentId: leather.id, equipped: true },
          { entryId: 'chain', equipmentId: chain.id, equipped: true },
          { entryId: 'dagger', equipmentId: dagger.id, equipped: false },
        ],
        actions: [{ kind: 'weapon', equipmentEntryId: 'dagger' }],
      },
      catalogs,
      'draft',
    )
    expect(issues).toEqual([
      expect.objectContaining({
        code: MONSTER_CATALOG_ISSUE_CODE.multipleEquippedBodyArmor,
        path: 'equipment.1.equipped',
      }),
    ])
  })

  it('requires equipped body armor only when publishing equipment Armor Class', () => {
    const body = { armorClass: { kind: 'equipment' }, equipment: [] }
    expect(collectMonsterCatalogIssues(body, catalogs, 'draft')).toEqual([])
    expect(collectMonsterCatalogIssues(body, catalogs, 'publish')).toEqual([
      expect.objectContaining({
        code: MONSTER_CATALOG_ISSUE_CODE.equipmentAcMissingBodyArmor,
        path: 'armorClass.kind',
      }),
    ])
  })

  it('does not flag equipped body armor under natural Armor Class', () => {
    expect(
      collectMonsterCatalogIssues(
        {
          armorClass: { kind: 'natural' },
          equipment: [{ entryId: 'leather', equipmentId: leather.id, equipped: true }],
        },
        catalogs,
        'publish',
      ),
    ).toEqual([])
  })
})
