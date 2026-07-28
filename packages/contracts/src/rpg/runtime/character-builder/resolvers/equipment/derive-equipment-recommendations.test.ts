import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { assembleCharacterProficiencies } from '../../assembly/assemble-proficiencies'
import { buildChoiceSetId } from '../../choice-set'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { deriveEquipmentRecommendations } from './derive-equipment-recommendations'
import { resolveEquipmentPickerItems } from './resolve-equipment-picker-items'
import { compareEquipmentPickerItemsByRecommendation } from '../picker/equipment-picker-item'
import {
  nestedStartingEquipmentChoiceSetId,
  startingEquipmentChoiceSetId,
} from './resolve-starting-equipment-choice-sets'
import { rogueClass } from '../../proficiency-test-fixtures'

const RULESET = 'srd-cc-5.2.1' as const

const CONTENT_META = {
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const chainMail = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:chain-mail`,
  slug: 'chain-mail',
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
  ...CONTENT_META,
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  name: 'Longsword',
  description: '',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
  properties: [],
  mastery: 'sap',
})

const dagger = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:dagger`,
  slug: 'dagger',
  name: 'Dagger',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 4 } },
  damageType: 'piercing',
  properties: ['finesse', 'light', 'thrown'],
  mastery: 'nick',
  range: { normal: 20, long: 60 },
})

const thievesTools = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:thieves-tools`,
  slug: 'thieves-tools',
  name: "Thieves' Tools",
  description: '',
  cost: { amount: 25, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'thieves',
  ability: 'dex',
  utilizes: [{ description: 'Pick a lock', dc: 15 }],
})

const arcaneCrystal = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:crystal`,
  slug: 'crystal',
  name: 'Crystal',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'spellcasting',
  spellcastingGearKind: 'arcane_focus',
})

const holySymbol = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:holy-symbol`,
  slug: 'holy-symbol',
  name: 'Holy Symbol',
  description: '',
  cost: { amount: 5, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'spellcasting',
  spellcastingGearKind: 'holy_symbol',
  holySymbolUsage: ['held'],
})

const spellbook = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:spellbook`,
  slug: 'spellbook',
  name: 'Spellbook',
  description: '',
  cost: { amount: 50, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'spellcasting',
  spellcastingGearKind: 'spellbook',
})

const componentPouch = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:component-pouch`,
  slug: 'component-pouch',
  name: 'Component Pouch',
  description: '',
  cost: { amount: 25, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'spellcasting',
  spellcastingGearKind: 'component_pouch',
})

const rope = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:rope`,
  slug: 'rope',
  name: 'Rope',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const storedFighter: ClassStored = {
  ...CONTENT_META,
  id: `${RULESET}:fighter`,
  slug: 'fighter',
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
              target: { source: 'equipment', equipmentSlug: 'longsword' },
              quantity: 1,
              equipped: true,
            },
          ],
          wealth: { gp: 4 },
        },
      ],
    },
  },
}

const storedWizard: ClassStored = {
  ...CONTENT_META,
  id: `${RULESET}:wizard`,
  slug: 'wizard',
  name: 'Wizard',
  primaryAbilities: ['int'],
  hitDie: 6,
  spellcasting: {
    level: 1,
    progression: 'full',
    ability: 'int',
    preparation: 'prepared',
    requiredGear: ['spellbook'],
    focusKinds: ['arcane_focus'],
  },
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
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 2,
            },
          ],
          wealth: { gp: 5 },
        },
      ],
    },
  },
}

function buildContext(
  characterClass: ClassStored,
  equipment: Parameters<typeof indexCharacterBuildCatalog>[0]['equipment'],
  draftPatch?: Partial<ReturnType<typeof createEmptyCharacterBuilderDraft>>,
) {
  const catalogIndex = indexCharacterBuildCatalog({
    species: [],
    classes: [characterClass],
    spells: [],
    equipment,
    skillProficiencies: [],
    languages: [],
  })
  const draft = {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: characterClass.id, level: 1 as const },
    ...draftPatch,
  }
  const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, [], characterClass)
  return { catalogIndex, proficiencies, draft }
}

describe('deriveEquipmentRecommendations', () => {
  it('classifies fighter proficient gear as compatible without purchase recommendations for granted items', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(
      storedFighter,
      [chainMail, longsword, dagger, rope],
      {
        choiceSelections: {
          [startingEquipmentChoiceSetId(storedFighter.id)]: ['heavy-armor'],
        },
      },
    )

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedFighter,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(chainMail.id)).toMatchObject({
      tier: 'compatible',
      reasons: ['proficient'],
    })
    expect(recommendations.get(longsword.id)?.tier).toBe('compatible')
    expect(recommendations.get(dagger.id)).toMatchObject({
      tier: 'compatible',
      reasons: ['proficient'],
    })
    expect(recommendations.get(rope.id)).toMatchObject({ tier: 'neutral', reasons: [] })
  })

  it('ranks non-proficient weapon and armor gear as notRecommended for the wizard', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(
      storedWizard,
      [chainMail, longsword, dagger],
      {
        choiceSelections: {
          [startingEquipmentChoiceSetId(storedWizard.id)]: ['standard-equipment'],
        },
      },
    )

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedWizard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(chainMail.id)).toMatchObject({
      tier: 'notRecommended',
      reasons: ['notProficient'],
    })
    expect(recommendations.get(longsword.id)?.tier).toBe('notRecommended')
    expect(recommendations.get(dagger.id)?.tier).toBe('compatible')
  })

  it('marks item-level tool proficiencies as essential class tool needs', () => {
    const { catalogIndex, proficiencies } = buildContext(rogueClass, [thievesTools, longsword])

    const recommendations = deriveEquipmentRecommendations({
      characterClass: rogueClass,
      catalogIndex,
      proficiencies,
    })

    expect(recommendations.get(thievesTools.id)).toMatchObject({
      tier: 'essential',
      reasons: expect.arrayContaining(['classToolNeed']),
    })
    expect(recommendations.get(longsword.id)?.tier).toBe('compatible')
  })

  it('marks authored focus kinds as essential when spellcasting is active', () => {
    const { catalogIndex, proficiencies } = buildContext(storedWizard, [arcaneCrystal, holySymbol])

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedWizard,
      catalogIndex,
      proficiencies,
    })

    expect(recommendations.get(arcaneCrystal.id)).toMatchObject({
      tier: 'essential',
      reasons: ['spellcastingFocus'],
    })
    expect(recommendations.get(holySymbol.id)?.tier).toBe('neutral')
  })

  it('demotes focus gear to strong while spellcasting is not yet active', () => {
    const laterCaster: ClassStored = {
      ...storedWizard,
      spellcasting: { ...storedWizard.spellcasting!, level: 2 },
    }
    const { catalogIndex, proficiencies } = buildContext(laterCaster, [arcaneCrystal])

    const recommendations = deriveEquipmentRecommendations({
      characterClass: laterCaster,
      catalogIndex,
      proficiencies,
      classLevel: 1,
    })

    expect(recommendations.get(arcaneCrystal.id)?.tier).toBe('strong')
  })

  it('infers focus kinds from starting-package grants when spellcasting.focusKinds is absent', () => {
    const inferredCleric: ClassStored = {
      ...storedWizard,
      id: `${RULESET}:cleric`,
      slug: 'cleric',
      name: 'Cleric',
      spellcasting: { level: 1, progression: 'full', ability: 'wis', preparation: 'prepared' },
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
                  target: { source: 'equipment', equipmentSlug: 'holy-symbol' },
                  quantity: 1,
                },
              ],
            },
          ],
        },
      },
    }
    const { catalogIndex, proficiencies } = buildContext(inferredCleric, [
      holySymbol,
      arcaneCrystal,
    ])

    const recommendations = deriveEquipmentRecommendations({
      characterClass: inferredCleric,
      catalogIndex,
      proficiencies,
    })

    expect(recommendations.get(holySymbol.id)).toMatchObject({
      tier: 'essential',
      reasons: ['spellcastingFocus'],
    })
    expect(recommendations.get(arcaneCrystal.id)?.tier).toBe('neutral')
  })

  it('applies requiredGear from spellcasting config as essential', () => {
    const { catalogIndex, proficiencies } = buildContext(storedWizard, [spellbook, rope])

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedWizard,
      catalogIndex,
      proficiencies,
    })

    expect(recommendations.get(spellbook.id)).toMatchObject({
      tier: 'essential',
      reasons: ['classRequired'],
    })
    expect(recommendations.get(rope.id)?.tier).toBe('neutral')
  })

  it('applies recommendedGear from spellcasting config as strong', () => {
    const wizardWithRecommendedGear: ClassStored = {
      ...storedWizard,
      spellcasting: {
        ...storedWizard.spellcasting!,
        recommendedGear: ['component_pouch'],
      },
    }
    const { catalogIndex, proficiencies } = buildContext(wizardWithRecommendedGear, [
      componentPouch,
      rope,
    ])

    const recommendations = deriveEquipmentRecommendations({
      characterClass: wizardWithRecommendedGear,
      catalogIndex,
      proficiencies,
    })

    expect(recommendations.get(componentPouch.id)).toMatchObject({
      tier: 'strong',
      reasons: ['classSuggested'],
    })
    expect(recommendations.get(rope.id)?.tier).toBe('neutral')
  })

  it('ignores authored rules below their minLevel', () => {
    const gatedWizard: ClassStored = {
      ...storedWizard,
      spellcasting: {
        ...storedWizard.spellcasting!,
        requiredGear: undefined,
      },
      characterCreation: {
        ...storedWizard.characterCreation!,
        equipmentRecommendations: {
          essential: [
            {
              match: { source: 'explicit', equipmentSlugs: ['spellbook'] },
              minLevel: 3,
            },
          ],
        },
      },
    }
    const { catalogIndex, proficiencies } = buildContext(gatedWizard, [spellbook])

    const recommendations = deriveEquipmentRecommendations({
      characterClass: gatedWizard,
      catalogIndex,
      proficiencies,
      classLevel: 1,
    })

    expect(recommendations.get(spellbook.id)?.tier).toBe('neutral')
  })
})

const lute = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:lute`,
  slug: 'lute',
  name: 'Lute',
  description: '',
  cost: { amount: 35, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play', dc: 10 }],
})

const flute = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:flute`,
  slug: 'flute',
  name: 'Flute',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play', dc: 10 }],
})

const drum = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:drum`,
  slug: 'drum',
  name: 'Drum',
  description: '',
  cost: { amount: 6, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play', dc: 10 }],
})

const viol = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:viol`,
  slug: 'viol',
  name: 'Viol',
  description: '',
  cost: { amount: 30, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play', dc: 10 }],
})

const panFlute = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:pan-flute`,
  slug: 'pan-flute',
  name: 'Pan Flute',
  description: '',
  cost: { amount: 12, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play', dc: 10 }],
})

const leatherArmor = equipmentSchema.parse({
  ...CONTENT_META,
  id: `${RULESET}:leather-armor`,
  slug: 'leather-armor',
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

const storedBard: ClassStored = {
  ...CONTENT_META,
  id: `${RULESET}:bard`,
  slug: 'bard',
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
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: 'Musical Instruments',
            choose: 3,
            pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
          },
        ],
      },
    },
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
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 2,
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

const storedMonk: ClassStored = {
  ...CONTENT_META,
  id: `${RULESET}:monk`,
  slug: 'monk',
  name: 'Monk',
  primaryAbilities: ['dex', 'wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['str', 'dex'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: "Artisan's Tools or Musical Instrument",
            choose: 1,
            pool: { source: 'filtered', toolCategories: ['artisan', 'musical_instrument'] },
          },
        ],
      },
    },
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

const bardInstruments = [lute, flute, drum, viol, panFlute]
const bardCatalogEquipment = [leatherArmor, dagger, ...bardInstruments]
const bardToolChoiceSetId = buildChoiceSetId('class', storedBard.id, 'class-tools')
const monkToolChoiceSetId = buildChoiceSetId('class', storedMonk.id, 'class-tools')

describe('deriveEquipmentRecommendations proficiency inference', () => {
  it('recommends all musical instruments before bard proficiency selection', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment)

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    for (const instrument of bardInstruments) {
      expect(recommendations.get(instrument.id)).toMatchObject({
        tier: 'strong',
        reasons: expect.arrayContaining(['unresolvedToolProficiencyChoice']),
      })
    }
  })

  it('excludes selected instruments from unresolved pool recommendations when partially resolved', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment, {
      choiceSelections: { [bardToolChoiceSetId]: [lute.id] },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(lute.id)?.reasons).toEqual(
      expect.arrayContaining(['selectedToolProficiency']),
    )
    expect(recommendations.get(lute.id)?.reasons).not.toContain('unresolvedToolProficiencyChoice')
    expect(recommendations.get(flute.id)?.reasons).toContain('unresolvedToolProficiencyChoice')
  })

  it('marks selected proficiencies and category siblings after bard proficiency resolution', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment, {
      choiceSelections: {
        [bardToolChoiceSetId]: [lute.id, flute.id, drum.id],
      },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(lute.id)).toMatchObject({
      tier: 'strong',
      reasons: expect.arrayContaining(['selectedToolProficiency']),
    })
    expect(recommendations.get(panFlute.id)).toMatchObject({
      tier: 'compatible',
      reasons: expect.arrayContaining(['classToolCategory']),
    })
  })

  it('keeps bard standard-package fulfillment separate from proficiency recommendations', () => {
    const nestedChoiceSetId = nestedStartingEquipmentChoiceSetId(
      storedBard.id,
      'standard-equipment',
      2,
    )
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment, {
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBard.id)]: ['standard-equipment'],
        [bardToolChoiceSetId]: [flute.id, drum.id, viol.id],
        [nestedChoiceSetId]: [lute.id],
      },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(lute.id)?.reasons).toContain('startingEquipment')
    expect(recommendations.get(lute.id)?.reasons).not.toContain('selectedToolProficiency')
    expect(recommendations.get(flute.id)?.reasons).toContain('selectedToolProficiency')
    expect(recommendations.get(panFlute.id)?.reasons).toContain('classToolCategory')
    expect(recommendations.get(panFlute.id)?.reasons).not.toContain('startingEquipmentChoice')
  })

  it('elevates bard category siblings on gold path when category equipment need remains unfulfilled', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment, {
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBard.id)]: ['starting-gold'],
        [bardToolChoiceSetId]: [lute.id, flute.id, drum.id],
      },
      equipment: { mode: 'gold', purchases: [], removedPackageItemKeys: [], customized: false },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(panFlute.id)).toMatchObject({
      tier: 'strong',
      reasons: expect.arrayContaining(['classToolCategory']),
    })
  })

  it('does not add persistent category siblings for monk single-choice pools after resolution', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedMonk, bardInstruments, {
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedMonk.id)]: ['standard-equipment'],
        [monkToolChoiceSetId]: [lute.id],
      },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedMonk,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(lute.id)?.reasons).toContain('selectedToolProficiency')
    expect(recommendations.get(flute.id)?.reasons).not.toContain('classToolCategory')
    expect(recommendations.get(flute.id)?.reasons).not.toContain('startingEquipmentChoice')
  })

  it('recommends monk pool members while proficiency choice is unresolved', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedMonk, bardInstruments, {
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedMonk.id)]: ['standard-equipment'],
      },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedMonk,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(lute.id)).toMatchObject({
      tier: 'strong',
      reasons: expect.arrayContaining(['unresolvedToolProficiencyChoice']),
    })
  })

  it('adds starting-equipment shopping guidance on gold path', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment, {
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBard.id)]: ['starting-gold'],
      },
      equipment: { mode: 'gold', purchases: [], removedPackageItemKeys: [], customized: false },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(lute.id)?.reasons).toEqual(
      expect.arrayContaining(['unresolvedToolProficiencyChoice', 'startingEquipmentChoice']),
    )
    expect(recommendations.get(leatherArmor.id)).toMatchObject({
      tier: 'strong',
      reasons: expect.arrayContaining(['availableInStartingOption']),
    })
    expect(recommendations.get(dagger.id)).toMatchObject({
      tier: 'strong',
      reasons: expect.arrayContaining(['availableInStartingOption']),
    })
  })

  it('keeps no-package-selected fixed grants at compatible tier', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment)

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(leatherArmor.id)).toMatchObject({
      tier: 'compatible',
      reasons: expect.arrayContaining(['availableInStartingOption', 'proficient']),
    })
    expect(recommendations.get(leatherArmor.id)?.reasons).not.toContain('startingEquipmentChoice')
  })

  it('does not duplicate monk linked grants as fixed package guidance on gold path', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedMonk, bardInstruments, {
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedMonk.id)]: ['starting-gold'],
      },
      equipment: { mode: 'gold', purchases: [], removedPackageItemKeys: [], customized: false },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedMonk,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(lute.id)?.reasons).toContain('unresolvedToolProficiencyChoice')
    expect(recommendations.get(lute.id)?.reasons).not.toContain('availableInStartingOption')
  })

  it('assigns exact specificity to bard gold-path grants and pool specificity to unresolved instruments', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment, {
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBard.id)]: ['starting-gold'],
      },
      equipment: { mode: 'gold', purchases: [], removedPackageItemKeys: [], customized: false },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(leatherArmor.id)).toMatchObject({
      tier: 'strong',
      specificity: 'exact',
      reasons: expect.arrayContaining(['availableInStartingOption']),
    })
    expect(recommendations.get(dagger.id)).toMatchObject({
      tier: 'strong',
      specificity: 'exact',
    })
    expect(recommendations.get(lute.id)).toMatchObject({
      tier: 'strong',
      specificity: 'narrow_pool',
      reasons: expect.arrayContaining(['unresolvedToolProficiencyChoice']),
    })
    expect(recommendations.get(flute.id)?.specificity).toBe('narrow_pool')
  })

  it('keeps selected tool proficiencies at exact specificity', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment, {
      choiceSelections: {
        [bardToolChoiceSetId]: [lute.id],
      },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })

    expect(recommendations.get(lute.id)).toMatchObject({
      tier: 'strong',
      specificity: 'exact',
      reasons: expect.arrayContaining(['selectedToolProficiency']),
    })
  })

  it('sorts bard gold-path leather armor before lute in picker browse order', () => {
    const { catalogIndex, proficiencies, draft } = buildContext(storedBard, bardCatalogEquipment, {
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedBard.id)]: ['starting-gold'],
      },
      equipment: { mode: 'gold', purchases: [], removedPackageItemKeys: [], customized: false },
    })

    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedBard,
      catalogIndex,
      proficiencies,
      draft,
      choiceSets: [],
    })
    const items = resolveEquipmentPickerItems({
      equipment: bardCatalogEquipment,
      proficiencies,
      recommendations,
    })
    const sorted = [...items].sort(compareEquipmentPickerItemsByRecommendation)
    const leatherIndex = sorted.findIndex((item) => item.equipment.id === leatherArmor.id)
    const luteIndex = sorted.findIndex((item) => item.equipment.id === lute.id)

    expect(leatherIndex).toBeGreaterThanOrEqual(0)
    expect(luteIndex).toBeGreaterThanOrEqual(0)
    expect(leatherIndex).toBeLessThan(luteIndex)
  })
})

describe('resolveEquipmentPickerItems', () => {
  it('attaches recommendations and derives isRecommended from tier membership', () => {
    const { catalogIndex, proficiencies } = buildContext(storedWizard, [
      chainMail,
      longsword,
      dagger,
    ])
    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedWizard,
      catalogIndex,
      proficiencies,
    })

    const items = resolveEquipmentPickerItems({
      equipment: [chainMail, longsword, dagger],
      proficiencies,
      recommendations,
      budget: {
        starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
        spent: { cp: 0, sp: 0, gp: 0, pp: 0 },
        remaining: { cp: 0, sp: 0, gp: 10, pp: 0 },
      },
    })

    const chainMailItem = items.find((item) => item.equipment.id === chainMail.id)!
    expect(chainMailItem.state.isAvailable).toBe(true)
    expect(chainMailItem.state.isProficient).toBe(false)
    expect(chainMailItem.state.isAffordable).toBe(true)
    expect(chainMailItem.state.isWithinRemainingBudget).toBe(false)
    expect(chainMailItem.state.isRecommended).toBe(false)
    expect(chainMailItem.state.recommendation.tier).toBe('notRecommended')

    const daggerItem = items.find((item) => item.equipment.id === dagger.id)!
    expect(daggerItem.state.isRecommended).toBe(false)
    expect(daggerItem.state.recommendation.tier).toBe('compatible')
  })

  it('excludes vehicle and service rows from picker results', () => {
    const rowboat = equipmentSchema.parse({
      ...CONTENT_META,
      id: `${RULESET}:rowboat`,
      slug: 'rowboat',
      name: 'Rowboat',
      description: '',
      cost: { amount: 50, currency: 'gp' },
      kind: 'vehicle',
      vehicleCategory: 'water',
      speed: { value: 1.5, unit: 'mph' },
    })
    const skilledHireling = equipmentSchema.parse({
      ...CONTENT_META,
      id: `${RULESET}:skilled-hireling`,
      slug: 'skilled-hireling',
      name: 'Skilled Hireling',
      description: '',
      cost: { amount: 2, currency: 'gp' },
      kind: 'service',
      serviceCategory: 'hireling',
      duration: { value: 1, unit: 'day' },
    })

    const { catalogIndex, proficiencies } = buildContext(storedWizard, [
      longsword,
      rowboat,
      skilledHireling,
    ])
    const recommendations = deriveEquipmentRecommendations({
      characterClass: storedWizard,
      catalogIndex,
      proficiencies,
    })

    const items = resolveEquipmentPickerItems({
      equipment: [longsword, rowboat, skilledHireling],
      proficiencies,
      recommendations,
    })

    expect(items.map((item) => item.equipment.name)).toEqual(['Longsword'])
  })
})
