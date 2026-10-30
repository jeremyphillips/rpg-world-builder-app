import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../equipment'
import type { Spell } from '../spell/body'
import { skillProficiencySchema } from '../skill-proficiency'
import { collectMonsterCatalogIssues, MONSTER_CATALOG_ISSUE_CODE } from './monster-catalog-issues'
import type { MonsterCatalogs } from './monster-catalog-issues'

const RULESET = 'srd-cc-5.2.1'

function armor(slug: string, name: string) {
  return equipmentSchema.parse({
    id: `${RULESET}:${slug}`,
    slug,
    rulesetId: RULESET,
    catalogLayer: 'system',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name,
    description: '',
    cost: { amount: 1, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    kind: 'armor',
    category: 'light',
    baseAcOffset: 1,
    stealthDisadvantage: false,
  })
}

const dagger = equipmentSchema.parse({
  id: `${RULESET}:dagger`,
  slug: 'dagger',
  rulesetId: RULESET,
  catalogLayer: 'system',
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

const athletics = skillProficiencySchema.parse({
  id: `${RULESET}:athletics`,
  slug: 'athletics',
  rulesetId: RULESET,
  catalogLayer: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Athletics',
  ability: 'str',
  examples: ['Climbing'],
})

function readyCatalogs(overrides: Partial<MonsterCatalogs> = {}): MonsterCatalogs {
  return {
    equipmentById: new Map([dagger, leather, chain].map((item) => [item.id, item])),
    skillBySlug: new Map([[athletics.slug, athletics]]),
    equipmentCatalog: 'ready',
    skillCatalog: 'ready',
    ...overrides,
  }
}

describe('collectMonsterCatalogIssues', () => {
  it('blocks unknown equipment, non-weapon actions, and armor modifiers on every intent', () => {
    const issues = collectMonsterCatalogIssues(
      {
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
      readyCatalogs(),
      'draft',
    )
    expect(issues.map((issue) => issue.code)).toEqual([
      MONSTER_CATALOG_ISSUE_CODE.unknownEquipment,
      MONSTER_CATALOG_ISSUE_CODE.armorClassModifierNotArmor,
      MONSTER_CATALOG_ISSUE_CODE.weaponActionNotWeapon,
    ])
    expect(issues.map((issue) => issue.path)).toEqual([
      'equipment.0.equipmentId',
      'equipment.2.adjustments',
      'reactions.0.equipmentEntryId',
    ])
  })

  it('blocks a second owned body armor even when one is unequipped', () => {
    const issues = collectMonsterCatalogIssues(
      {
        equipment: [
          { entryId: 'leather', equipmentId: leather.id, equipped: true, quantity: 1 },
          { entryId: 'chain', equipmentId: chain.id, equipped: false, quantity: 1 },
          { entryId: 'dagger', equipmentId: dagger.id, equipped: false },
        ],
        actions: [{ kind: 'weapon', equipmentEntryId: 'dagger' }],
      },
      readyCatalogs(),
      'draft',
    )
    expect(issues).toEqual([
      expect.objectContaining({
        code: MONSTER_CATALOG_ISSUE_CODE.multipleOwnedBodyArmor,
        path: 'equipment.1',
      }),
    ])
  })

  it('reports slot quantity and a second shield on draft and publish', () => {
    const shield = equipmentSchema.parse({
      ...leather,
      id: `${RULESET}:shield`,
      slug: 'shield',
      name: 'Shield',
      category: 'shields',
      baseAcOffset: undefined,
      acBonus: 2,
    })
    const catalogs = readyCatalogs({
      equipmentById: new Map([...readyCatalogs().equipmentById, [shield.id, shield]]),
    })
    const body = {
      equipment: [
        { entryId: 'leather', equipmentId: leather.id, quantity: 2, equipped: true },
        { entryId: 'shield-a', equipmentId: shield.id, quantity: 1, equipped: false },
        { entryId: 'shield-b', equipmentId: shield.id, quantity: 1, equipped: true },
      ],
    }
    const expected = [
      expect.objectContaining({
        code: MONSTER_CATALOG_ISSUE_CODE.armorSlotQuantity,
        path: 'equipment.0.quantity',
      }),
      expect.objectContaining({
        code: MONSTER_CATALOG_ISSUE_CODE.multipleOwnedShield,
        path: 'equipment.2',
      }),
    ]
    expect(collectMonsterCatalogIssues(body, catalogs, 'draft')).toEqual(expected)
    expect(collectMonsterCatalogIssues(body, catalogs, 'publish')).toEqual(expected)
  })

  it('accepts one owned body armor and one shield', () => {
    const shield = equipmentSchema.parse({
      ...leather,
      id: `${RULESET}:shield`,
      slug: 'shield',
      name: 'Shield',
      category: 'shields',
      baseAcOffset: undefined,
      acBonus: 2,
    })
    expect(
      collectMonsterCatalogIssues(
        {
          equipment: [
            { entryId: 'leather', equipmentId: leather.id, equipped: true, quantity: 1 },
            { entryId: 'shield', equipmentId: shield.id, equipped: true, quantity: 1 },
          ],
        },
        readyCatalogs({
          equipmentById: new Map([...readyCatalogs().equipmentById, [shield.id, shield]]),
        }),
        'publish',
      ),
    ).toEqual([])
  })

  it('allows unresolved skills on draft and validates them on publish', () => {
    const body = {
      proficiencies: { skills: [{ skill: 'missing-skill', rank: 'proficient' as const }] },
    }
    expect(collectMonsterCatalogIssues(body, readyCatalogs(), 'draft')).toEqual([])
    expect(collectMonsterCatalogIssues(body, readyCatalogs(), 'publish')).toEqual([
      expect.objectContaining({
        code: MONSTER_CATALOG_ISSUE_CODE.unknownSkill,
        path: 'proficiencies.skills.0.skill',
      }),
    ])
  })

  it('blocks publish when the skill catalog is unavailable', () => {
    expect(
      collectMonsterCatalogIssues(
        { proficiencies: { skills: [{ skill: 'athletics' }] } },
        readyCatalogs({ skillCatalog: 'unavailable' }),
        'publish',
      ),
    ).toEqual([
      expect.objectContaining({
        code: MONSTER_CATALOG_ISSUE_CODE.skillCatalogUnavailable,
        path: 'proficiencies.skills',
      }),
    ])
  })

  it('allows unresolved magic presets on draft and rejects them on publish', () => {
    const body = {
      equipment: [
        {
          entryId: 'sword',
          equipmentId: dagger.id,
          magical: true,
          magicProperties: [{ kind: 'preset' as const, propertyId: 'missing-preset' }],
        },
      ],
    }
    const provider = () => undefined
    expect(
      collectMonsterCatalogIssues(
        body,
        readyCatalogs({ magicPropertyProvider: provider }),
        'draft',
      ),
    ).toEqual([])
    expect(
      collectMonsterCatalogIssues(
        body,
        readyCatalogs({ magicPropertyProvider: provider }),
        'publish',
      ).map((row) => row.code),
    ).toContain('unknown_magic_property_preset')
  })

  it('rejects an incompatible spell casting time on publish and allows the draft', () => {
    const fireball = {
      id: `${RULESET}:fireball`,
      status: 'published',
      castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
    } as Spell
    const body = {
      bonusActions: [
        {
          kind: 'spell',
          spells: [{ spellId: fireball.id }],
        },
      ],
    }
    const catalogs = readyCatalogs({
      spellsById: new Map([[fireball.id, fireball]]),
      spellCatalog: 'ready',
    })
    expect(collectMonsterCatalogIssues(body, catalogs, 'draft')).toEqual([])
    expect(
      collectMonsterCatalogIssues(body, catalogs, 'publish').map((issue) => issue.code),
    ).toEqual([MONSTER_CATALOG_ISSUE_CODE.spellCastingTimeIncompatible])
  })

  it('skips equipment row checks on draft when the equipment catalog is unavailable', () => {
    expect(
      collectMonsterCatalogIssues(
        { equipment: [{ entryId: 'x', equipmentId: 'nope' }] },
        readyCatalogs({ equipmentCatalog: 'unavailable' }),
        'draft',
      ),
    ).toEqual([])
  })
})
