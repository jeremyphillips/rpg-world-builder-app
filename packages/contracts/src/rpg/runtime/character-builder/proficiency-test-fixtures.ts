import type { ClassStored } from '../../content/classes/class'
import type { Equipment } from '../../content/equipment'
import type { SkillProficiency } from '../../content/skill-proficiency'
import { resolveCharacterCreationPatch } from '../../campaign/patches/campaign-character-creation-patch'
import { defaultCampaignMechanicsPatch } from '../../campaign/patches/campaign-mechanics-patch'
import { resolveCharacterOwnershipTarget } from '../character-acquisition'
import { DEFAULT_ABILITY_GENERATION_RULES } from './ability/ability-generation'
import type { CharacterBuildCatalog, CharacterBuildContext } from './context'
import { builderTestLanguages, dwarfSpecies, startingWealthSeed } from './test-fixtures'

export { dwarfSpecies }

export const stealthSkill = {
  id: 'srd-cc-5.2.1:stealth',
  slug: 'stealth',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Stealth',
  ability: 'dex',
  examples: ['Escape notice by moving quietly and hiding behind things'],
} as const satisfies SkillProficiency

export const acrobaticsSkill = {
  id: 'srd-cc-5.2.1:acrobatics',
  slug: 'acrobatics',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Acrobatics',
  ability: 'dex',
  examples: ['Stay on your feet in a tricky situation', 'Perform an acrobatic stunt'],
} as const satisfies SkillProficiency

export const perceptionSkill = {
  id: 'srd-cc-5.2.1:perception',
  slug: 'perception',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Perception',
  ability: 'wis',
  examples: ["Using a combination of senses, notice something that's easy to miss"],
} as const satisfies SkillProficiency

export const rogueClass: ClassStored = {
  id: 'srd-cc-5.2.1:rogue',
  slug: 'rogue',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rogue',
  primaryAbilities: ['dex'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['dex', 'int'],
    armor: { categories: ['light'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    tools: { categories: [], items: ['thieves-tools'] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [
          {
            id: 'class-skills',
            label: 'Rogue Skills',
            choose: 2,
            from: ['acrobatics', 'stealth', 'perception'],
          },
        ],
      },
    },
  },
  features: [],
}

export const luteTool = {
  id: 'srd-cc-5.2.1:lute',
  slug: 'lute',
  rulesetId: 'srd-cc-5.2.1',
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
} as const satisfies Equipment

export const fluteTool = {
  id: 'srd-cc-5.2.1:flute',
  slug: 'flute',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Flute',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'dex',
  utilizes: [{ description: 'Play a known tune', dc: 10 }],
} as const satisfies Equipment

export const bardClass: ClassStored = {
  id: 'srd-cc-5.2.1:bard',
  slug: 'bard',
  rulesetId: 'srd-cc-5.2.1',
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
  characterCreation: {
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: 'Bard Tools',
            choose: 1,
            pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
          },
        ],
      },
    },
  },
  features: [],
}

export const monkClass: ClassStored = {
  id: 'srd-cc-5.2.1:monk',
  slug: 'monk',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
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
  characterCreation: {
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
  features: [],
}

export const proficiencyTestCatalog: CharacterBuildCatalog = {
  species: [dwarfSpecies],
  classes: [rogueClass, bardClass, monkClass],
  spells: [],
  equipment: [luteTool, fluteTool],
  skillProficiencies: [stealthSkill, acrobaticsSkill, perceptionSkill],
  languages: [...builderTestLanguages],
}

export const proficiencyTestContext: CharacterBuildContext = {
  channel: 'build',
  surface: 'dashboard',
  characterKind: 'pc',
  mode: 'dashboard',
  scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
  rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
  ownershipTarget: resolveCharacterOwnershipTarget('pc', {
    type: 'ruleset',
    rulesetId: 'srd-cc-5.2.1',
  }),
  rulesetId: 'srd-cc-5.2.1',
  catalog: proficiencyTestCatalog,
  characterCreationRules: {
    ...resolveCharacterCreationPatch(undefined, startingWealthSeed),
    abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
    armorClass: defaultCampaignMechanicsPatch().armorClass,
  },
  permissions: { canCreateCharacter: true },
}
