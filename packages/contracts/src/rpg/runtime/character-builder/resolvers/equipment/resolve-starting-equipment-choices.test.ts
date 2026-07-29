import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog, type CharacterBuildCatalog } from '../../context'
import { resolveStartingEquipmentChoices } from './resolve-starting-equipment-choices'
import {
  nestedStartingEquipmentChoiceSetId,
  startingEquipmentChoiceSetId,
} from './resolve-starting-equipment-choice-sets'

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

const storedBard: ClassStored = {
  id: `${RULESET}:bard`,
  slug: 'bard',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Bard',
  primaryAbilities: ['cha'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['dex', 'cha'],
    armor: { categories: ['light'], items: [] },
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
              kind: 'choice',
              choose: 1,
              pool: {
                source: 'filtered',
                equipmentKind: 'tool',
                toolCategory: 'musical_instrument',
              },
            },
          ],
          wealth: { gp: 19 },
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 90 },
        },
      ],
    },
  },
}

const bardClass = storedBard

function catalogFor(classes: ClassStored[]): CharacterBuildCatalog {
  return {
    species: [],
    classes,
    spells: [],
    equipment: [leatherArmor, lute],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  }
}

describe('resolveStartingEquipmentChoices', () => {
  it('emits the package ChoiceSet when class has starting equipment', () => {
    const catalogIndex = indexCharacterBuildCatalog(catalogFor([storedBard]))
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: bardClass.id, level: 1 as const },
    }

    const choiceSets = resolveStartingEquipmentChoices(draft, {} as never, catalogIndex)
    const main = choiceSets.find(
      (choiceSet) => choiceSet.id === startingEquipmentChoiceSetId(bardClass.id),
    )

    expect(main).toMatchObject({
      choiceType: 'equipment',
      min: 1,
      max: 1,
      required: true,
      options: [
        { id: 'standard-equipment', label: 'Standard Equipment' },
        { id: 'starting-gold', label: 'Starting Gold' },
      ],
    })
    expect(choiceSets).toHaveLength(1)
  })

  it('emits nested pool ChoiceSets after the package option is selected', () => {
    const catalogIndex = indexCharacterBuildCatalog(catalogFor([storedBard]))
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: bardClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(bardClass.id)]: ['standard-equipment'],
      },
    }

    const nestedId = nestedStartingEquipmentChoiceSetId(bardClass.id, 'standard-equipment', 1)
    const choiceSets = resolveStartingEquipmentChoices(draft, {} as never, catalogIndex)
    const nested = choiceSets.find((choiceSet) => choiceSet.id === nestedId)

    expect(nested).toMatchObject({
      choiceType: 'equipment',
      min: 1,
      max: 1,
      required: true,
    })
    expect(nested?.options).toEqual([{ id: lute.id, label: 'Lute' }])
  })
})
