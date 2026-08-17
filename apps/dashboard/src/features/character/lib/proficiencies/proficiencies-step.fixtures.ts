import {
  ABILITY_IDS,
  DEFAULT_ABILITY_GENERATION_RULES,
  DEFAULT_SYSTEM_RULESET_ID,
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  defaultCampaignMechanicsPatch,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
  resolveCharacterCreationPatch,
  resolveProficiencyStepModel,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type ClassStored,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { pickSkillProficiency, pickSpecies } from '@/test/fixtures/pick'

import { createPopulatedStandaloneBuilderContextFixture } from '../character-builder-fixtures'

const RULESET = DEFAULT_SYSTEM_RULESET_ID

export const PROFICIENCIES_STEP_STALE_SKILL_OPTION_ID = 'removed-skill' as const

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const proficienciesStepLanguages = [
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
] as const

export const proficienciesStepStealthSkill = pickSkillProficiency('stealth')

export const proficienciesStepAcrobaticsSkill = pickSkillProficiency('acrobatics')

export const proficienciesStepPerceptionSkill = pickSkillProficiency('perception')

export const proficienciesStepRogueClass = {
  id: `${RULESET}:rogue`,
  slug: 'rogue',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  ...timestamps,
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
} as const satisfies ClassStored

export const proficienciesStepDwarfSpecies = pickSpecies('dwarf')

export function createEmptyProficienciesStepPreviewFixture(): CharacterBuildPreview {
  return {
    abilityScores: {},
    proficiencyBonus: undefined,
    maxHp: undefined,
    ac: undefined,
    savingThrows: ABILITY_IDS.map((ability) => ({
      ability,
      bonus: undefined,
      proficient: false,
    })),
    skills: [],
    spellcasting: null,
    proficiencies: {
      skills: [],
      tools: [],
      languages: [],
      weapons: [],
      armor: [],
    },
    equipmentSummary: [],
    unresolvedChoiceSetIds: [],
    warnings: [],
  }
}

export function createProficienciesStepRogueContextFixture(
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
      species: [proficienciesStepDwarfSpecies],
      classes: [proficienciesStepRogueClass],
      spells: [],
      equipment: [],
      skillProficiencies: [
        proficienciesStepStealthSkill,
        proficienciesStepAcrobaticsSkill,
        proficienciesStepPerceptionSkill,
      ],
      organizations: [],
      languages: [...proficienciesStepLanguages],
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

export function createProficienciesStepRogueDraftFixture(
  overrides: Partial<CharacterBuilderDraft> = {},
): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: proficienciesStepRogueClass.id, level: 1 },
    ...overrides,
  }
}

export function createProficienciesStepRogueFixture(
  draftOverrides: Partial<CharacterBuilderDraft> = {},
) {
  const context = createProficienciesStepRogueContextFixture()
  const draft = createProficienciesStepRogueDraftFixture(draftOverrides)
  const resolvedChoiceSets = resolveAvailableChoices(draft, context)
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const preview = buildCharacterPreview(
    draft,
    catalogIndex,
    context.characterCreationRules,
    context.rulesetId,
    { resolvedChoiceSets },
  )
  const model = resolveProficiencyStepModel({
    draft,
    context,
    preview,
    choiceSets: resolvedChoiceSets,
  })

  return { context, draft, resolvedChoiceSets, preview, model }
}

export function createProficienciesStepOriginLanguagesFixture() {
  const context = createPopulatedStandaloneBuilderContextFixture()
  const draft = createEmptyCharacterBuilderDraft()
  const resolvedChoiceSets = resolveAvailableChoices(draft, context)
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const preview = buildCharacterPreview(
    draft,
    catalogIndex,
    context.characterCreationRules,
    context.rulesetId,
    { resolvedChoiceSets },
  )
  const model = resolveProficiencyStepModel({
    draft,
    context,
    preview,
    choiceSets: resolvedChoiceSets,
  })

  return { context, draft, resolvedChoiceSets, preview, model }
}

export function createProficienciesStepRogueWithSkillSelectionsFixture(
  skillIds: readonly string[] = [
    proficienciesStepStealthSkill.id,
    proficienciesStepAcrobaticsSkill.id,
  ],
) {
  const base = createProficienciesStepRogueFixture()
  const skillChoiceSetId = base.resolvedChoiceSets.find(
    (choiceSet) => choiceSet.choiceType === 'skillProficiency',
  )!.id

  return createProficienciesStepRogueFixture({
    choiceSelections: {
      [skillChoiceSetId]: [...skillIds],
    },
  })
}

export function createProficienciesStepRogueWithStaleSkillFixture() {
  const base = createProficienciesStepRogueFixture()
  const skillChoiceSetId = base.resolvedChoiceSets.find(
    (choiceSet) => choiceSet.choiceType === 'skillProficiency',
  )!.id

  return createProficienciesStepRogueFixture({
    choiceSelections: {
      [skillChoiceSetId]: [
        proficienciesStepStealthSkill.id,
        PROFICIENCIES_STEP_STALE_SKILL_OPTION_ID,
      ],
    },
  })
}
