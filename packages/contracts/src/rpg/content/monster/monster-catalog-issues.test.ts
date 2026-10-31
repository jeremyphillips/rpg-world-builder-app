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
    const body = {
      equipment: [
        { entryId: 'missing', equipmentId: 'nope', equipped: true },
        { entryId: 'leather', equipmentId: leather.id, equipped: true },
        {
          entryId: 'dagger',
          equipmentId: dagger.id,
          modifiers: [{ kind: 'armor_class' as const, bonus: 1 }],
        },
      ],
      reactions: [{ kind: 'weapon', equipmentEntryId: 'leather' }],
    }
    const issues = collectMonsterCatalogIssues(body, readyCatalogs(), 'draft')
    const expected = [
      {
        path: 'equipment.0.equipmentId',
        code: MONSTER_CATALOG_ISSUE_CODE.unknownEquipment,
        message: 'Unknown equipment.',
      },
      {
        path: 'equipment.2.adjustments',
        code: MONSTER_CATALOG_ISSUE_CODE.armorClassModifierNotArmor,
        message: 'Armor Class adjustments are only allowed on armor or shields.',
      },
      {
        path: 'reactions.0.equipmentEntryId',
        code: MONSTER_CATALOG_ISSUE_CODE.weaponActionNotWeapon,
        message: 'Weapon action must reference a weapon.',
      },
    ]
    expect(issues).toEqual(expected)
    expect(collectMonsterCatalogIssues(body, readyCatalogs(), 'publish')).toEqual(expected)
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
    const draftSkill = skillProficiencySchema.parse({
      ...athletics,
      id: `${RULESET}:stealth`,
      slug: 'stealth',
      name: 'Stealth',
      status: 'draft',
    })
    const hiddenSkill = {
      ...athletics,
      id: `${RULESET}:acrobatics`,
      slug: 'acrobatics',
      name: 'Acrobatics',
      campaignAccess: { available: false },
    }
    const catalogs = readyCatalogs({
      skillBySlug: new Map([
        [athletics.slug, athletics],
        [draftSkill.slug, draftSkill],
        [hiddenSkill.slug, hiddenSkill as typeof athletics],
      ]),
    })
    const body = {
      proficiencies: {
        skills: [
          { skill: 'missing-skill', rank: 'proficient' as const },
          { skill: draftSkill.slug, rank: 'proficient' as const },
          { skill: hiddenSkill.slug, rank: 'proficient' as const },
        ],
      },
    }
    expect(collectMonsterCatalogIssues(body, catalogs, 'draft')).toEqual([])
    expect(collectMonsterCatalogIssues(body, catalogs, 'publish')).toEqual([
      {
        path: 'proficiencies.skills.0.skill',
        code: MONSTER_CATALOG_ISSUE_CODE.unknownSkill,
        message: 'Unknown skill.',
      },
      {
        path: 'proficiencies.skills.1.skill',
        code: MONSTER_CATALOG_ISSUE_CODE.skillNotReferenceable,
        message: 'Publish this skill before using it on a monster.',
      },
      {
        path: 'proficiencies.skills.2.skill',
        code: MONSTER_CATALOG_ISSUE_CODE.skillNotCampaignEligible,
        message: 'This skill is not available in this campaign.',
      },
    ])
  })

  it('blocks publish when the skill catalog is unavailable', () => {
    expect(
      collectMonsterCatalogIssues(
        { proficiencies: { skills: [] } },
        readyCatalogs({ skillCatalog: 'unavailable' }),
        'publish',
      ),
    ).toEqual([
      {
        path: 'proficiencies.skills',
        code: MONSTER_CATALOG_ISSUE_CODE.skillCatalogUnavailable,
        message: 'Skills could not be loaded. Try again before publishing.',
      },
    ])
    expect(
      collectMonsterCatalogIssues(
        { proficiencies: { skills: [{ skill: 'missing-skill' }] } },
        readyCatalogs({ skillCatalog: 'unavailable' }),
        'publish',
      ),
    ).toEqual([
      {
        path: 'proficiencies.skills',
        code: MONSTER_CATALOG_ISSUE_CODE.skillCatalogUnavailable,
        message: 'Skills could not be loaded. Try again before publishing.',
      },
    ])
  })

  it('reports one equipment catalog issue on publish and skips unknown rows', () => {
    const body = { equipment: [{ entryId: 'x', equipmentId: 'nope' }] }
    expect(
      collectMonsterCatalogIssues(
        body,
        readyCatalogs({ equipmentCatalog: 'unavailable' }),
        'publish',
      ),
    ).toEqual([
      {
        path: 'equipment',
        code: MONSTER_CATALOG_ISSUE_CODE.equipmentCatalogUnavailable,
        message: 'Equipment could not be loaded. Try again before publishing.',
      },
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
