import {
  DEFAULT_SYSTEM_RULESET_ID,
  indexCharacterBuildCatalog,
  type CharacterBuildCatalog,
  type ClassStored,
  type Equipment,
} from '@rpg/contracts'

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
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard',
          label: 'Standard Equipment',
          description: 'Leather armor, a musical instrument, and starting gold.',
          items: [
            { kind: 'grant', equipmentSlug: 'leather-armor', quantity: 1, equipped: true },
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
          id: 'gold',
          label: 'Starting Gold',
          description: 'Take gold instead of a gear package.',
          items: [],
          wealth: { gp: 90 },
        },
      ],
    },
  },
} as const satisfies ClassStored

export const equipmentStepCatalogFixture = {
  species: [],
  classes: [equipmentStepBardClassFixture],
  spells: [],
  equipment: [equipmentStepLeatherArmorFixture, equipmentStepLuteFixture],
  skillProficiencies: [],
  languages: [],
} as const satisfies CharacterBuildCatalog

export const equipmentStepCatalogIndexFixture = indexCharacterBuildCatalog(
  equipmentStepCatalogFixture,
)
