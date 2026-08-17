import {
  DEFAULT_ABILITY_GENERATION_RULES,
  DEFAULT_SYSTEM_RULESET_ID,
  defaultCampaignMechanicsPatch,
  resolveCharacterCreationPatch,
  type CharacterBuildContext,
  type ClassStored,
  type Spell,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { pickSkillProficiency, pickSpecies } from '@/test/fixtures/pick'
import { makeSpell } from '@/test/fixtures/factories/spell'

const RULESET = DEFAULT_SYSTEM_RULESET_ID

export const spellsStepFighterClass = {
  id: `${RULESET}:fighter`,
  slug: 'fighter',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
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
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
  },
  features: [],
} as const satisfies ClassStored

export const spellsStepWizardClass = {
  id: `${RULESET}:fixture-wizard`,
  slug: 'fixture-wizard',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
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
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
  },
  features: [],
  spellcasting: {
    level: 1,
    progression: 'full',
    ability: 'int',
    preparation: 'prepared',
    cantrips: [{ level: 1, known: 3 }],
    spellsAvailable: [{ level: 1, count: 4 }],
  },
} as const satisfies ClassStored

function spell(slug: string, level: number, name: string): Spell {
  return makeSpell({
    slug,
    name,
    level,
    classIds: ['fixture-wizard'],
    description: '<p>Test spell.</p>',
  })
}

export const spellsStepWizardCantrips = [
  spell('arcane-bolt', 0, 'Arcane Bolt'),
  spell('mage-hand', 0, 'Mage Hand'),
  spell('prestidigitation', 0, 'Prestidigitation'),
  spell('ray-of-frost', 0, 'Ray of Frost'),
]

export const spellsStepWizardSpells = [
  spell('burning-hands', 1, 'Burning Hands'),
  spell('detect-magic', 1, 'Detect Magic'),
  spell('magic-missile', 1, 'Magic Missile'),
  spell('shield', 1, 'Shield'),
]

export const spellsStepDwarfSpecies = pickSpecies('dwarf')

export const spellsStepAthleticsSkill = pickSkillProficiency('athletics')

export function createSpellsStepContextFixture(
  overrides: Partial<CharacterBuildContext> = {},
): CharacterBuildContext {
  const rulesetId = overrides.rulesetId ?? RULESET

  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'pc',
    mode: 'dashboard',
    scope: { type: 'standalone', rulesetId },
    rulesScope: { type: 'ruleset', rulesetId },
    ownershipTarget: { type: 'user' },
    rulesetId,
    catalog: {
      species: [spellsStepDwarfSpecies],
      classes: [spellsStepFighterClass, spellsStepWizardClass],
      spells: [...spellsStepWizardCantrips, ...spellsStepWizardSpells],
      equipment: [],
      skillProficiencies: [spellsStepAthleticsSkill],
      organizations: [],
      languages: [],
    },
    characterCreationRules: {
      ...resolveCharacterCreationPatch(undefined, getStandardStartingWealthRules(rulesetId)),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    },
    permissions: { canCreateCharacter: true },
    ...overrides,
  }
}
