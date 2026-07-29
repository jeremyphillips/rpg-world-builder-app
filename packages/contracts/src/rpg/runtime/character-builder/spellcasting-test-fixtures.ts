import { classSchema, type ClassStored } from '../../content/classes/class'
import type { Spell } from '../../content/spell'
import { resolveCharacterCreationPatch } from '../../campaign/patches/campaign-character-creation-patch'
import { defaultCampaignMechanicsPatch } from '../../campaign/patches/campaign-mechanics-patch'
import type { Species } from '../../content/species'
import type { SkillProficiency } from '../../content/skill-proficiency'
import { resolveCharacterOwnershipTarget } from '../character-acquisition'
import { DEFAULT_ABILITY_GENERATION_RULES } from './ability/ability-generation'
import type { CharacterBuildCatalog, CharacterBuildContext } from './context'
import { dwarfSpecies, startingWealthSeed, storedFighter } from './test-fixtures'

export const RULESET = 'srd-cc-5.2.1' as const

const baseMeta = {
  rulesetId: RULESET,
  source: 'system' as const,
  status: 'published' as const,
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const defaultSkillChoices = {
  proficiencies: {
    skills: {
      choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
    },
  },
}

export const nonCasterClass = {
  ...storedFighter,
  id: `${RULESET}:fixture-fighter`,
  slug: 'fixture-fighter',
  rulesetId: RULESET,
} satisfies ClassStored

export const wizardStored: ClassStored = {
  ...baseMeta,
  id: `${RULESET}:fixture-wizard`,
  slug: 'fixture-wizard',
  name: 'Wizard',
  description: '<p>Arcane scholar.</p>',
  primaryAbilities: ['int'],
  hitDie: 6,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: defaultSkillChoices,
  features: [],
  spellcasting: {
    level: 1,
    progression: 'full',
    ability: 'int',
    preparation: 'prepared',
    cantrips: [{ level: 1, known: 3 }],
    spellsAvailable: [{ level: 1, count: 4 }],
  },
}

export const wizardClass = classSchema.parse(wizardStored)

export const paladinStored: ClassStored = {
  ...baseMeta,
  id: `${RULESET}:fixture-paladin`,
  slug: 'fixture-paladin',
  name: 'Paladin',
  description: '<p>Holy warrior.</p>',
  primaryAbilities: ['str', 'cha'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['wis', 'cha'],
    armor: { categories: ['light', 'medium', 'heavy', 'shields'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: defaultSkillChoices,
  features: [],
  spellcasting: {
    level: 1,
    progression: 'half',
    ability: 'cha',
    preparation: 'prepared',
    spellsAvailable: [{ level: 1, count: 2 }],
  },
}

export const paladinClass = classSchema.parse(paladinStored)

export const warlockStored: ClassStored = {
  ...baseMeta,
  id: `${RULESET}:fixture-warlock`,
  slug: 'fixture-warlock',
  name: 'Warlock',
  description: '<p>Pact binder.</p>',
  primaryAbilities: ['cha'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['wis', 'cha'],
    armor: { categories: ['light'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: defaultSkillChoices,
  features: [],
  spellcasting: {
    level: 1,
    progression: 'pact',
    ability: 'cha',
    preparation: 'prepared',
    cantrips: [{ level: 1, known: 2 }],
    spellsAvailable: [{ level: 1, count: 2 }],
  },
}

export const warlockClass = classSchema.parse(warlockStored)

function spell(slug: string, level: number, classSlugs: string[], name = slug): Spell {
  return {
    ...baseMeta,
    id: `${RULESET}:${slug}`,
    slug,
    name,
    description: '<p>Test spell.</p>',
    school: 'evocation',
    level,
    classIds: classSlugs,
    castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
    range: { kind: 'self' },
    duration: { kind: 'instantaneous' },
    components: { verbal: true },
  }
}

export const wizardCantrips = [
  spell('arcane-bolt', 0, ['fixture-wizard'], 'Arcane Bolt'),
  spell('mage-hand', 0, ['fixture-wizard'], 'Mage Hand'),
  spell('prestidigitation', 0, ['fixture-wizard'], 'Prestidigitation'),
  spell('ray-of-frost', 0, ['fixture-wizard'], 'Ray of Frost'),
  spell('shocking-grasp', 0, ['fixture-wizard'], 'Shocking Grasp'),
]

export const wizardLevelOneSpells = [
  spell('burning-hands', 1, ['fixture-wizard'], 'Burning Hands'),
  spell('charm-person', 1, ['fixture-wizard'], 'Charm Person'),
  spell('detect-magic', 1, ['fixture-wizard'], 'Detect Magic'),
  spell('magic-missile', 1, ['fixture-wizard'], 'Magic Missile'),
  spell('shield', 1, ['fixture-wizard'], 'Shield'),
  spell('sleep', 1, ['fixture-wizard'], 'Sleep'),
]

export const paladinLevelOneSpells = [
  spell('bless', 1, ['fixture-paladin'], 'Bless'),
  spell('cure-wounds', 1, ['fixture-paladin'], 'Cure Wounds'),
  spell('heroism', 1, ['fixture-paladin'], 'Heroism'),
  spell('searing-smite', 1, ['fixture-paladin'], 'Searing Smite'),
]

export const warlockCantrips = [
  spell('eldritch-blast', 0, ['fixture-warlock'], 'Eldritch Blast'),
  spell('minor-illusion', 0, ['fixture-warlock'], 'Minor Illusion'),
  spell('prestidigitation-warlock', 0, ['fixture-warlock'], 'Prestidigitation'),
]

export const warlockLevelOneSpells = [
  spell('charm-person-warlock', 1, ['fixture-warlock'], 'Charm Person'),
  spell('hex', 1, ['fixture-warlock'], 'Hex'),
  spell('hellish-rebuke', 1, ['fixture-warlock'], 'Hellish Rebuke'),
]

export const highLevelWizardSpell = spell('fireball', 3, ['fixture-wizard'], 'Fireball')

export const testSpecies = {
  ...dwarfSpecies,
  id: `${RULESET}:fixture-dwarf`,
  slug: 'fixture-dwarf',
  rulesetId: RULESET,
} as const satisfies Species

export const athleticsSkill = {
  id: `${RULESET}:athletics`,
  slug: 'athletics',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Athletics',
  ability: 'str',
  examples: ['Jump farther than normal', 'Stay afloat in rough water', 'Break something'],
} as const satisfies SkillProficiency

export const spellcastingTestCatalog: CharacterBuildCatalog = {
  species: [testSpecies],
  classes: [nonCasterClass, wizardClass, paladinClass, warlockClass],
  spells: [
    ...wizardCantrips,
    ...wizardLevelOneSpells,
    ...paladinLevelOneSpells,
    ...warlockCantrips,
    ...warlockLevelOneSpells,
    highLevelWizardSpell,
  ],
  equipment: [],
  skillProficiencies: [athleticsSkill],
  organizations: [],
  languages: [],
}

export const spellcastingTestContext: CharacterBuildContext = {
  channel: 'build',
  surface: 'dashboard',
  characterKind: 'pc',
  mode: 'dashboard',
  scope: { type: 'standalone', rulesetId: RULESET },
  rulesScope: { type: 'ruleset', rulesetId: RULESET },
  ownershipTarget: resolveCharacterOwnershipTarget('pc', { type: 'ruleset', rulesetId: RULESET }),
  rulesetId: RULESET,
  catalog: spellcastingTestCatalog,
  characterCreationRules: {
    ...resolveCharacterCreationPatch(undefined, startingWealthSeed),
    abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
    armorClass: defaultCampaignMechanicsPatch().armorClass,
  },
  permissions: { canCreateCharacter: true },
}
