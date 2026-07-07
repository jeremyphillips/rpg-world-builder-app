import type { ClassStored } from '../../content/classes/class'
import type { SkillProficiency } from '../../content/skill-proficiency'
import type { Species } from '../../content/species'
import { resolveCharacterCreationPatch } from '../../campaign/patches/campaign-character-creation-patch'
import { defaultCampaignMechanicsPatch } from '../../campaign/patches/campaign-mechanics-patch'
import type { StartingWealthRules } from '../../campaign/rules/starting-wealth'
import { DEFAULT_ABILITY_GENERATION_RULES } from './ability-generation'
import type {
  CharacterBuildCatalog,
  CharacterBuildContext,
  CharacterBuildLanguageOption,
} from './context'

export const builderTestLanguages = [
  {
    id: 'common',
    label: 'Common',
    description: 'Trade language.',
    category: 'standard',
  },
  {
    id: 'elvish',
    label: 'Elvish',
    description: 'Elven language.',
    category: 'standard',
  },
  {
    id: 'dwarvish',
    label: 'Dwarvish',
    description: 'Dwarven language.',
    category: 'standard',
  },
  {
    id: 'draconic',
    label: 'Draconic',
    description: 'Draconic language.',
    category: 'standard',
  },
  {
    id: 'abyssal',
    label: 'Abyssal',
    description: 'Infernal language.',
    category: 'rare',
  },
] as const satisfies readonly CharacterBuildLanguageOption[]

export const startingWealthSeed: StartingWealthRules = {
  name: 'Standard starting wealth',
  scope: { kind: 'standard' },
  tiers: [
    {
      id: 'tier-1',
      label: 'Levels 1–4',
      minLevel: 1,
      maxLevel: 20,
      includeNormalStartingEquipment: true,
      magicItemGrants: [],
    },
  ],
}

export const storedFighter: ClassStored = {
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 2, from: ['athletics'] }],
      },
    },
  },
  features: [],
}

export const fighterClass = storedFighter

export const athleticsSkill = {
  id: 'srd-cc-5.2.1:athletics',
  slug: 'athletics',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Athletics',
  ability: 'str',
} as const satisfies SkillProficiency

export const dwarfSpecies = {
  id: 'srd-cc-5.2.1:dwarf',
  slug: 'dwarf',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dwarf',
  description: '<p>Stout and hardy folk.</p>',
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  languageAffinities: ['dwarvish'],
  traits: [],
} as const satisfies Species

export const builderTestCatalog: CharacterBuildCatalog = {
  species: [dwarfSpecies],
  classes: [fighterClass],
  spells: [],
  equipment: [],
  skillProficiencies: [athleticsSkill],
  languages: [...builderTestLanguages],
}

export const builderTestRules = {
  ...resolveCharacterCreationPatch(undefined, startingWealthSeed),
  abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
  armorClass: defaultCampaignMechanicsPatch().armorClass,
}

export const builderTestContext: CharacterBuildContext = {
  mode: 'dashboard',
  scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
  rulesetId: 'srd-cc-5.2.1',
  catalog: builderTestCatalog,
  characterCreationRules: builderTestRules,
  permissions: { canCreateCharacter: true },
}
