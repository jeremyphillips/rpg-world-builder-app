import { describe, expect, it } from 'vitest'

import type { Equipment } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import {
  DEFAULT_STANDARD_EQUIPMENT_LABEL,
  formatStartingEquipmentPackageDescription,
  formatStartingGoldOptionDescription,
} from './format-starting-equipment-option-description'
import { resolveStartingEquipmentOptionSummaries } from './resolve-starting-equipment-option-summaries'

const RULESET = 'srd-cc-5.2.1' as const

function equipmentFixture(
  slug: string,
  name: string,
  kind: Equipment['kind'],
  category?: string,
): Equipment {
  const base = {
    id: `${RULESET}:${slug}`,
    slug,
    rulesetId: RULESET,
    source: 'system' as const,
    status: 'published' as const,
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name,
    description: '',
    cost: { amount: 1, currency: 'gp' as const },
    weight: { value: 1, unit: 'lb' as const },
    kind,
  }

  if (kind === 'armor') {
    return {
      ...base,
      category: category ?? 'heavy',
      baseAc: 16,
      addDexModifier: false,
      maxDexBonus: 0,
      stealthDisadvantage: true,
    } as Equipment
  }

  if (kind === 'adventuring_gear') {
    return {
      ...base,
      gearKind: 'general',
    } as Equipment
  }

  return {
    ...base,
    category: category ?? 'martial',
    mode: 'melee',
    damage: { dice: { count: 1, faces: 8 }, type: 'slashing' },
    properties: [],
    mastery: 'cleave',
  } as Equipment
}

const fighterEquipment = [
  equipmentFixture('chain-mail', 'Chain Mail', 'armor'),
  equipmentFixture('greatsword', 'Greatsword', 'weapon'),
  equipmentFixture('flail', 'Flail', 'weapon'),
  equipmentFixture('javelin', 'Javelin', 'weapon'),
  equipmentFixture('dungeoneers-pack', "Dungeoneer's Pack", 'adventuring_gear'),
]

const storedFighter: ClassStored = {
  id: `${RULESET}:fighter`,
  slug: 'fighter',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str', 'dex'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['heavy'], items: [] },
    weapons: { categories: ['martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'heavy-armor',
          label: 'Heavy Armor',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'chain-mail' },
              quantity: 1,
              equipped: true,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'greatsword' },
              quantity: 1,
              equipped: true,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'flail' },
              quantity: 1,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'javelin' },
              quantity: 8,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dungeoneers-pack' },
              quantity: 1,
            },
          ],
          wealth: { gp: 4 },
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 155 },
        },
      ],
    },
  },
}

describe('formatStartingGoldOptionDescription', () => {
  it('formats gold copy with default standard-equipment label', () => {
    expect(
      formatStartingGoldOptionDescription({
        wealth: { cp: 0, sp: 0, gp: 155, pp: 0 },
      }),
    ).toBe(`Take 155 GP instead of ${DEFAULT_STANDARD_EQUIPMENT_LABEL}.`)
  })

  it('keeps description on baseline wealth only (tier lines are structured separately)', () => {
    expect(
      formatStartingGoldOptionDescription({
        wealth: { cp: 0, sp: 0, gp: 75, pp: 0 },
      }),
    ).toBe(`Take 75 GP instead of ${DEFAULT_STANDARD_EQUIPMENT_LABEL}.`)
  })
})

describe('formatStartingEquipmentPackageDescription', () => {
  it('builds fighter heavy package copy in authored item order with trailing wealth', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedFighter],
      spells: [],
      equipment: fighterEquipment,
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })

    const [heavy] = resolveStartingEquipmentOptionSummaries(storedFighter, catalogIndex)

    expect(heavy?.description).toBe(
      "Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack, and 4 GP.",
    )
    expect(
      formatStartingEquipmentPackageDescription({
        orderedItems: heavy!.orderedItems,
        wealth: heavy!.wealth,
      }),
    ).toBe(heavy!.description)
  })

  it('preserves authored item order in phrases', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedFighter],
      spells: [],
      equipment: fighterEquipment,
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })

    const summaries = resolveStartingEquipmentOptionSummaries(storedFighter, catalogIndex)
    const heavy = summaries.find((summary) => summary.optionId === 'heavy-armor')!

    expect(heavy.orderedItems.map((item) => item.kind)).toEqual([
      'grant',
      'grant',
      'grant',
      'grant',
      'grant',
    ])
    expect(heavy.orderedItems[0]).toMatchObject({ equipmentSlug: 'chain-mail' })
    expect(heavy.orderedItems[3]).toMatchObject({ equipmentSlug: 'javelin', quantity: 8 })
  })
})

describe('resolveStartingEquipmentOptionSummaries descriptions', () => {
  it('keeps gold description on baseline wealth and exposes structured tier metadata', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedFighter],
      spells: [],
      equipment: fighterEquipment,
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedFighter.id, level: 5 as const },
    }

    const summaries = resolveStartingEquipmentOptionSummaries(storedFighter, catalogIndex, draft, {
      fundingByOptionId: new Map([
        [
          'starting-gold',
          {
            classOptionId: 'starting-gold',
            classOptionWealth: { cp: 0, sp: 0, gp: 155, pp: 0 },
            tierAdditionalWealth: { cp: 0, sp: 0, gp: 600, pp: 0 },
            totalStartingWealth: { cp: 0, sp: 0, gp: 755, pp: 0 },
            classOptionPolicy: 'included',
            tierLabel: 'Legend',
          },
        ],
      ]),
    })

    const gold = summaries.find((summary) => summary.optionId === 'starting-gold')!
    expect(gold.description).toBe(`Take 155 GP instead of ${DEFAULT_STANDARD_EQUIPMENT_LABEL}.`)
    expect(gold.tierAdjustment?.label).toBe('Legend tier adds 600 GP')
    expect(gold.totalStartingWealthLabel).toBe('Total: 755 GP')
  })
})
