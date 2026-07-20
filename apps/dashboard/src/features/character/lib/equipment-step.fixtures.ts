import {
  DEFAULT_SYSTEM_RULESET_ID,
  indexCharacterBuildCatalog,
  type CharacterBuildCatalog,
  type ClassStored,
  type Equipment,
} from '@rpg/contracts'

export const equipmentStepBreastplateFixture = {
  id: 'srd-cc-5.2.1:breastplate',
  slug: 'breastplate',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Breastplate',
  description: '',
  cost: { amount: 400, currency: 'gp' },
  weight: { value: 20, unit: 'lb' },
  kind: 'armor',
  category: 'medium',
  material: 'metal',
  baseAc: 14,
  addDexModifier: true,
  maxDexBonus: 2,
  stealthDisadvantage: false,
} as const satisfies Equipment

export const equipmentStepLeatherArmorFixture = {
  id: 'srd-cc-5.2.1:leather-armor',
  slug: 'leather-armor',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
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
} as const satisfies Equipment

export const equipmentStepLuteFixture = {
  id: 'srd-cc-5.2.1:lute',
  slug: 'lute',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
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
} as const satisfies Equipment

export const equipmentStepDrumFixture = {
  id: 'srd-cc-5.2.1:drum',
  slug: 'drum',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Drum',
  description: '',
  cost: { amount: 6, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Keep a steady beat', dc: 10 }],
} as const satisfies Equipment

export const equipmentStepPotionOfHealingFixture = {
  id: 'srd-cc-5.2.1:potion-of-healing',
  slug: 'potion-of-healing',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Potion of Healing',
  description: '',
  kind: 'magic_item',
  rarity: 'common',
  magicItemCategory: 'potion',
  cost: { amount: 50, currency: 'gp' },
  weight: { value: 0.5, unit: 'lb' },
} as const satisfies Equipment

export const equipmentStepRationsFixture = {
  id: 'srd-cc-5.2.1:rations',
  slug: 'rations',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rations',
  description: '',
  kind: 'adventuring_gear',
  gearKind: 'consumable',
  cost: { amount: 5, currency: 'sp' },
  weight: { value: 2, unit: 'lb' },
} as const satisfies Equipment

export const equipmentStepSpearFixture = {
  id: 'srd-cc-5.2.1:spear',
  slug: 'spear',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Spear',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
  properties: ['thrown', 'versatile'],
  mastery: 'sap',
  versatileDamage: { count: 1, faces: 8 },
  range: { normal: 20, long: 60 },
} as const satisfies Equipment

export const equipmentStepDaggerFixture = {
  id: 'srd-cc-5.2.1:dagger',
  slug: 'dagger',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
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
  damage: { dice: { count: 1, faces: 4 } },
  damageType: 'piercing',
  properties: ['finesse', 'light', 'thrown'],
  mastery: 'nick',
  range: { normal: 20, long: 60 },
} as const satisfies Equipment

export const equipmentStepExplorersPackFixture = {
  id: 'srd-cc-5.2.1:explorers-pack',
  slug: 'explorers-pack',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: "Explorer's Pack",
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 59, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'container',
} as const satisfies Equipment

export const equipmentStepBardClassFixture = {
  id: 'srd-cc-5.2.1:bard',
  slug: 'bard',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
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
} as const satisfies ClassStored

export const equipmentStepMonkClassFixture = {
  id: 'srd-cc-5.2.1:monk',
  slug: 'monk',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
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
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'spear' },
              quantity: 1,
              equipped: true,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 5,
            },
            {
              kind: 'grant',
              target: { source: 'proficiency_choice', choiceId: 'class-tools' },
              quantity: 1,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'explorers-pack' },
              quantity: 1,
            },
          ],
          wealth: { gp: 11 },
        },
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: "Artisan's Tools or Musical Instrument",
            choose: 1,
            pool: {
              source: 'filtered',
              toolCategories: ['artisan', 'musical_instrument'],
            },
          },
        ],
      },
    },
  },
} as const satisfies ClassStored

export const equipmentStepCatalogFixture = {
  species: [],
  classes: [equipmentStepBardClassFixture, equipmentStepMonkClassFixture],
  spells: [],
  equipment: [
    equipmentStepBreastplateFixture,
    equipmentStepLeatherArmorFixture,
    equipmentStepLuteFixture,
    equipmentStepDrumFixture,
    equipmentStepSpearFixture,
    equipmentStepDaggerFixture,
    equipmentStepExplorersPackFixture,
    equipmentStepPotionOfHealingFixture,
    equipmentStepRationsFixture,
  ],
  skillProficiencies: [],
  languages: [],
} as const satisfies CharacterBuildCatalog

export const equipmentStepCatalogIndexFixture = indexCharacterBuildCatalog(
  equipmentStepCatalogFixture,
)
