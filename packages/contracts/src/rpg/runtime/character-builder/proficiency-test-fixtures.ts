import type { ClassStored } from '../../content/classes/class'
import type { SkillProficiency } from '../../content/skill-proficiency'
import { resolveCharacterCreationPatch } from '../../campaign/patches/campaign-character-creation-patch'
import { defaultCampaignMechanicsPatch } from '../../campaign/patches/campaign-mechanics-patch'
import { DEFAULT_ABILITY_GENERATION_RULES } from './ability-generation'
import type { CharacterBuildCatalog, CharacterBuildContext } from './context'
import { builderTestLanguages, dwarfSpecies, startingWealthSeed } from './test-fixtures'

export const stealthSkill = {
  id: 'srd-cc-5.2.1:stealth',
  slug: 'stealth',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Stealth',
  ability: 'dex',
} as const satisfies SkillProficiency

export const acrobaticsSkill = {
  id: 'srd-cc-5.2.1:acrobatics',
  slug: 'acrobatics',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Acrobatics',
  ability: 'dex',
} as const satisfies SkillProficiency

export const perceptionSkill = {
  id: 'srd-cc-5.2.1:perception',
  slug: 'perception',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Perception',
  ability: 'wis',
} as const satisfies SkillProficiency

export const rogueClass: ClassStored = {
  id: 'srd-cc-5.2.1:rogue',
  slug: 'rogue',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
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

export const proficiencyTestCatalog: CharacterBuildCatalog = {
  species: [dwarfSpecies],
  classes: [rogueClass],
  spells: [],
  equipment: [],
  skillProficiencies: [stealthSkill, acrobaticsSkill, perceptionSkill],
  languages: [...builderTestLanguages],
}

export const proficiencyTestContext: CharacterBuildContext = {
  mode: 'dashboard',
  scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
  rulesetId: 'srd-cc-5.2.1',
  catalog: proficiencyTestCatalog,
  characterCreationRules: {
    ...resolveCharacterCreationPatch(undefined, startingWealthSeed),
    abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
    armorClass: defaultCampaignMechanicsPatch().armorClass,
  },
  permissions: { canCreateCharacter: true },
}
