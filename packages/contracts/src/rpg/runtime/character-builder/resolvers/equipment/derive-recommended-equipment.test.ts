import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { assembleCharacterProficiencies } from '../../assembly/assemble-proficiencies'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { deriveRecommendedEquipment } from './derive-recommended-equipment'
import { resolveEquipmentPickerItems } from './resolve-equipment-picker-items'
import { rogueClass } from '../../proficiency-test-fixtures'

const RULESET = 'srd-cc-5.2.1' as const

const chainMail = equipmentSchema.parse({
  id: `${RULESET}:chain-mail`,
  slug: 'chain-mail',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Chain Mail',
  description: '',
  cost: { amount: 75, currency: 'gp' },
  weight: { value: 55, unit: 'lb' },
  kind: 'armor',
  category: 'heavy',
  baseAc: 16,
  addDexModifier: false,
  stealthDisadvantage: true,
  strengthRequirement: 13,
})

const longsword = equipmentSchema.parse({
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Longsword',
  description: '',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { kind: 'dice', count: 1, faces: 8 },
  damageType: 'slashing',
  properties: [],
  mastery: 'sap',
})

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
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { kind: 'dice', count: 1, faces: 4 },
  damageType: 'piercing',
  properties: ['finesse', 'light', 'thrown'],
  mastery: 'nick',
  range: { normal: 20, long: 60 },
})

const storedFighter: ClassStored = {
  id: `${RULESET}:fighter`,
  slug: 'fighter',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium', 'heavy', 'shields'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'heavy',
          label: 'Heavy Armor',
          items: [
            { kind: 'grant', equipmentSlug: 'chain-mail', quantity: 1, equipped: true },
            { kind: 'grant', equipmentSlug: 'longsword', quantity: 1, equipped: true },
          ],
          wealth: { gp: 4 },
        },
      ],
    },
  },
}

const storedWizard: ClassStored = {
  id: `${RULESET}:wizard`,
  slug: 'wizard',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Wizard',
  primaryAbilities: ['int'],
  hitDie: 6,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard',
          label: 'Standard Equipment',
          items: [{ kind: 'grant', equipmentSlug: 'dagger', quantity: 2 }],
          wealth: { gp: 5 },
        },
      ],
    },
  },
}

describe('deriveRecommendedEquipment', () => {
  it('includes fighter package grants and proficient-category weapons and armor', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedFighter],
      spells: [],
      equipment: [chainMail, longsword, dagger],
      skillProficiencies: [],
      languages: [],
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedFighter.id, level: 1 as const },
    }
    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, [], storedFighter)

    const recommended = deriveRecommendedEquipment({
      characterClass: storedFighter,
      catalogIndex,
      proficiencies,
    })

    expect(recommended.has(chainMail.id)).toBe(true)
    expect(recommended.has(longsword.id)).toBe(true)
    expect(recommended.has(dagger.id)).toBe(true)
  })

  it('includes wizard package grants and simple weapons but not martial gear', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedWizard],
      spells: [],
      equipment: [chainMail, longsword, dagger],
      skillProficiencies: [],
      languages: [],
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedWizard.id, level: 1 as const },
    }
    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, [], storedWizard)

    const recommended = deriveRecommendedEquipment({
      characterClass: storedWizard,
      catalogIndex,
      proficiencies,
    })

    expect(recommended.has(dagger.id)).toBe(true)
    expect(recommended.has(longsword.id)).toBe(false)
    expect(recommended.has(chainMail.id)).toBe(false)
  })

  it('includes proficient tools for classes with fixed tool grants', () => {
    const thievesTools = equipmentSchema.parse({
      id: `${RULESET}:thieves-tools`,
      slug: 'thieves-tools',
      rulesetId: RULESET,
      source: 'system',
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

    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [rogueClass],
      spells: [],
      equipment: [thievesTools, longsword],
      skillProficiencies: [],
      languages: [],
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
    }
    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, [], rogueClass)

    const recommended = deriveRecommendedEquipment({
      characterClass: rogueClass,
      catalogIndex,
      proficiencies,
    })

    expect(recommended.has(thievesTools.id)).toBe(true)
    expect(recommended.has(longsword.id)).toBe(true)
  })
})

describe('resolveEquipmentPickerItems', () => {
  it('keeps proficiency and availability flags independent', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedWizard],
      spells: [],
      equipment: [chainMail, longsword, dagger],
      skillProficiencies: [],
      languages: [],
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedWizard.id, level: 1 as const },
    }
    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, [], storedWizard)
    const recommended = deriveRecommendedEquipment({
      characterClass: storedWizard,
      catalogIndex,
      proficiencies,
    })

    const items = resolveEquipmentPickerItems({
      equipment: [chainMail, longsword],
      proficiencies,
      recommendedEquipmentIds: recommended,
      budget: {
        starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
        spent: { cp: 0, sp: 0, gp: 0, pp: 0 },
        remaining: { cp: 0, sp: 0, gp: 10, pp: 0 },
      },
    })

    const chainMailItem = items.find((item) => item.equipment.id === chainMail.id)!
    expect(chainMailItem.state.isAvailable).toBe(true)
    expect(chainMailItem.state.isProficient).toBe(false)
    expect(chainMailItem.state.isAffordable).toBe(false)
    expect(chainMailItem.state.isRecommended).toBe(false)
  })

  it('excludes vehicle and service rows from picker results', () => {
    const rowboat = equipmentSchema.parse({
      id: `${RULESET}:rowboat`,
      slug: 'rowboat',
      rulesetId: RULESET,
      source: 'system',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Rowboat',
      description: '',
      cost: { amount: 50, currency: 'gp' },
      kind: 'vehicle',
      vehicleCategory: 'water',
      speed: { value: 1.5, unit: 'mph' },
    })
    const skilledHireling = equipmentSchema.parse({
      id: `${RULESET}:skilled-hireling`,
      slug: 'skilled-hireling',
      rulesetId: RULESET,
      source: 'system',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Skilled Hireling',
      description: '',
      cost: { amount: 2, currency: 'gp' },
      kind: 'service',
      serviceCategory: 'hireling',
      duration: { value: 1, unit: 'day' },
    })

    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedWizard],
      spells: [],
      equipment: [longsword, rowboat, skilledHireling],
      skillProficiencies: [],
      languages: [],
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedWizard.id, level: 1 as const },
    }
    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, [], storedWizard)
    const recommended = deriveRecommendedEquipment({
      characterClass: storedWizard,
      catalogIndex,
      proficiencies,
    })

    const items = resolveEquipmentPickerItems({
      equipment: [longsword, rowboat, skilledHireling],
      proficiencies,
      recommendedEquipmentIds: recommended,
    })

    expect(items.map((item) => item.equipment.name)).toEqual(['Longsword'])
  })
})
