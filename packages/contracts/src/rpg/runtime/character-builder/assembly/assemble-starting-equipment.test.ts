import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import type { ClassStored } from '../../../content/classes/class'
import { assembleStartingEquipment } from './assemble-starting-equipment'
import { assembleCharacterProficiencies } from './assemble-proficiencies'
import { createEmptyCharacterBuilderDraft } from '../draft'
import { indexCharacterBuildCatalog } from '../context'
import { buildChoiceSetId } from '../choice-set'
import { resolveAvailableChoices } from '../resolvers/registry/resolve-choices'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import {
  fluteTool,
  luteTool,
  monkClass,
  proficiencyTestContext,
} from '../proficiency-test-fixtures'

const RULESET = 'srd-cc-5.2.1' as const

const rope = equipmentSchema.parse({
  id: `${RULESET}:rope`,
  slug: 'rope',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rope',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

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

const shield = equipmentSchema.parse({
  id: `${RULESET}:shield`,
  slug: 'shield',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Shield',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 6, unit: 'lb' },
  kind: 'armor',
  category: 'shields',
  acBonus: 2,
  addDexModifier: false,
  stealthDisadvantage: false,
})

const storedDruid: ClassStored = {
  id: `${RULESET}:druid`,
  slug: 'druid',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Druid',
  primaryAbilities: ['wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: ['light', 'shields'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'leather-armor' },
              quantity: 1,
              equipped: true,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'shield' },
              quantity: 1,
              equipped: true,
            },
          ],
          wealth: { gp: 9 },
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
  },
}

const druidClass = storedDruid

describe('assembleStartingEquipment', () => {
  it('assembles equipped armor entries and wealth from the selected package', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [druidClass],
      spells: [],
      equipment: [leatherArmor, shield],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: druidClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(druidClass.id)]: ['standard-equipment'],
      },
    }

    const { equipment, wealth } = assembleStartingEquipment(draft, catalogIndex)

    expect(wealth).toEqual({ cp: 0, sp: 0, gp: 9, pp: 0 })
    expect(equipment.armor).toEqual([
      {
        equipmentId: leatherArmor.id,
        quantity: 1,
        equipped: true,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: druidClass.id,
            grantId: 'standard-equipment',
          },
        ],
      },
      {
        equipmentId: shield.id,
        quantity: 1,
        equipped: true,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: druidClass.id,
            grantId: 'standard-equipment',
          },
        ],
      },
    ])
  })

  it('returns only wealth for a gold package selection', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [druidClass],
      spells: [],
      equipment: [leatherArmor, shield],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: druidClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(druidClass.id)]: ['starting-gold'],
      },
    }

    const { equipment, wealth } = assembleStartingEquipment(draft, catalogIndex)

    expect(wealth).toEqual({ cp: 0, sp: 0, gp: 50, pp: 0 })
    expect(equipment).toEqual({
      weapons: [],
      armor: [],
      tools: [],
      gear: [],
      magicItems: [],
      vehicles: [],
      mounts: [],
    })
  })

  it('derives remaining wealth and customized inventory when the equipment section is present', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [druidClass],
      spells: [],
      equipment: [leatherArmor, shield, rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: druidClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(druidClass.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: `${RULESET}:rope`,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [`${druidClass.id}:standard-equipment:0`],
        customized: true,
      },
    }

    const { equipment, wealth } = assembleStartingEquipment(draft, catalogIndex)

    expect(wealth).toEqual({ cp: 0, sp: 0, gp: 8, pp: 0 })
    expect(equipment.armor).toHaveLength(1)
    expect(equipment.armor[0]?.equipmentId).toBe(shield.id)
    expect(equipment.gear).toEqual([
      {
        equipmentId: `${RULESET}:rope`,
        quantity: 1,
        sources: [{ kind: 'startingGold', sourceId: druidClass.id, grantId: 'standard-equipment' }],
      },
    ])
  })
})

const drum = equipmentSchema.parse({
  id: `${RULESET}:drum`,
  slug: 'drum',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Drum',
  description: '',
  cost: { amount: 6, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'wis',
  utilizes: [{ description: 'Play a known tune', dc: 10 }],
})

const monkWithLinkedGrant: ClassStored = {
  ...monkClass,
  characterCreation: {
    ...monkClass.characterCreation,
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'proficiency_choice', choiceId: 'class-tools' },
              quantity: 1,
            },
          ],
        },
      ],
    },
  },
}

describe('proficiency-linked starting equipment lifecycle', () => {
  const monkCatalog = {
    ...proficiencyTestContext.catalog,
    classes: [monkWithLinkedGrant],
    equipment: [luteTool, fluteTool, drum],
  }
  const monkContext = { ...proficiencyTestContext, catalog: monkCatalog }
  const catalogIndex = indexCharacterBuildCatalog(monkCatalog)
  const monkToolChoiceSetId = buildChoiceSetId('class', monkWithLinkedGrant.id, 'class-tools')

  it('resolves linked tool grants from proficiency answers without a nested equipment ChoiceSet', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: monkWithLinkedGrant.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(monkWithLinkedGrant.id)]: ['standard-equipment'],
        [monkToolChoiceSetId]: [luteTool.id],
      },
    }

    const choiceSets = resolveAvailableChoices(draft, monkContext)
    const nestedEquipmentChoices = choiceSets.filter(
      (choiceSet) =>
        choiceSet.choiceType === 'equipment' &&
        choiceSet.id.includes('starting-equipment:standard'),
    )

    expect(nestedEquipmentChoices).toEqual([])

    const proficiencies = assembleCharacterProficiencies(
      draft,
      catalogIndex,
      choiceSets,
      monkWithLinkedGrant,
    )
    expect(proficiencies.tools.some((tool) => tool.toolId === luteTool.slug)).toBe(true)

    const { equipment } = assembleStartingEquipment(draft, catalogIndex)
    expect(equipment.tools).toEqual([
      {
        equipmentId: luteTool.id,
        quantity: 1,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: monkWithLinkedGrant.id,
            grantId: 'standard-equipment',
          },
        ],
      },
    ])
  })

  it('replaces linked inventory when the proficiency answer changes', () => {
    const luteDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: monkWithLinkedGrant.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(monkWithLinkedGrant.id)]: ['standard-equipment'],
        [monkToolChoiceSetId]: [luteTool.id],
      },
    }

    expect(assembleStartingEquipment(luteDraft, catalogIndex).equipment.tools[0]?.equipmentId).toBe(
      luteTool.id,
    )

    const drumDraft = {
      ...luteDraft,
      choiceSelections: {
        ...luteDraft.choiceSelections,
        [monkToolChoiceSetId]: [drum.id],
      },
    }

    expect(assembleStartingEquipment(drumDraft, catalogIndex).equipment.tools[0]?.equipmentId).toBe(
      drum.id,
    )
  })
})
