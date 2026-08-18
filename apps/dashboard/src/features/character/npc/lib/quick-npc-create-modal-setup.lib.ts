import {
  getContentTypeTerm,
  getNpcAuthoringTemplateEntry,
  getNpcAuthoringTemplateLabel,
  indexCharacterBuildCatalog,
  isClassProgressionApplicable,
  resolveOrganizationMembershipTitleDefinitionByLabel,
  resolvePlayableBuilderContent,
  resolveCharacterLevelConstraints,
  type CharacterBuildContext,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { formatBuilderDraftCharacterSummary } from '../../lib/builder-preview/preview-identity-summary'
import {
  buildOrganizationMembershipTitleRadioOptions,
  titleFromMembershipRadioValue,
} from '../../components/connections/organization-membership-title-field.lib'
import {
  isCreateSetupChoiceComplete,
  isCreateSetupNumberComplete,
  resolveCreateSetupCanContinue,
  type CreateSetupSet,
} from '@/lib/create-setup'

import { buildQuickNpcContentOptions, type QuickNpcSetupValues } from './quick-npc-form-fields'
import { buildQuickNpcClassRadioCardPresentation } from './quick-npc-class-option-groups.lib'
import { buildQuickNpcSpeciesRadioCardPresentation } from './quick-npc-species-option-groups.lib'

export const QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE = 'Set up member' as const
export const QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION =
  "Choose the member's role and starting character options. Recommendations come from this organization and can be changed before creation." as const
export const QUICK_NPC_SETUP_HEADLINE = QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE
export const QUICK_NPC_SETUP_CHANGE_LABEL = 'Change' as const
export const QUICK_NPC_SETUP_SUMMARY_EYEBROW = 'Setup' as const
export const QUICK_NPC_TITLE_FIELD_PROMPT =
  "Choose this member's role in the organization." as const
export const QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL = 'Recommended build' as const
export const QUICK_NPC_SPECIES_AFFINITY_PROMPT =
  "Recommended species are based on this organization's member affinities." as const
export const QUICK_NPC_CLASS_AFFINITY_PROMPT =
  "Recommended classes are based on this organization's member affinities." as const

export type QuickNpcSetupModel = {
  speciesOptions: ReturnType<typeof buildQuickNpcContentOptions>['speciesOptions']
  classOptions: ReturnType<typeof buildQuickNpcContentOptions>['classOptions']
  canContinue: boolean
  /** Canonical character summary (`formatCharacterSummary`) for the setup selection. */
  summaryLine: string
}

export function resolveQuickNpcSelectedTitleRecommendation(args: {
  membershipTitle: string
  titles: readonly OrganizationMembershipTitleDefinition[]
}) {
  const persistedTitle = titleFromMembershipRadioValue(args.membershipTitle)
  if (persistedTitle === undefined) {
    return undefined
  }
  return resolveOrganizationMembershipTitleDefinitionByLabel(args.titles, persistedTitle)
    ?.npcRecommendation
}

export function formatQuickNpcLevelRecommendationPrompt(args: {
  membershipTitle: string
  titles: readonly OrganizationMembershipTitleDefinition[]
}): string | undefined {
  const recommendation = resolveQuickNpcSelectedTitleRecommendation(args)
  if (recommendation === undefined) {
    return undefined
  }
  const persistedTitle = titleFromMembershipRadioValue(args.membershipTitle)
  if (persistedTitle === undefined) {
    return undefined
  }
  return `Recommended for ${persistedTitle}: Level ${recommendation.level}.`
}

export function formatQuickNpcSetupCharacterSummary(
  values: QuickNpcSetupValues,
  context: CharacterBuildContext,
): string {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  return formatBuilderDraftCharacterSummary(
    {
      species: { speciesId: values.speciesId },
      class: {
        classId: isClassProgressionApplicable(values.level) ? values.classId : undefined,
        level: values.level,
      },
    },
    catalogIndex,
  )
}

export function buildQuickNpcCreateSetupSets(args: {
  context: CharacterBuildContext
  values: QuickNpcSetupValues
  onApplySetupChange: (setId: string, nextValue: string | number) => void
  titles: readonly OrganizationMembershipTitleDefinition[]
  members?: { classAffinityIds?: readonly string[]; speciesAffinityIds?: readonly string[] }
}): CreateSetupSet[] {
  const { speciesOptions, classOptions } = buildQuickNpcContentOptions(args.context)
  const playableContent = resolvePlayableBuilderContent(args.context)
  const speciesPresentation = buildQuickNpcSpeciesRadioCardPresentation({
    speciesOptions,
    speciesAffinityIds: args.members?.speciesAffinityIds,
    playableSpecies: playableContent.species,
  })
  const classPresentation = buildQuickNpcClassRadioCardPresentation({
    classOptions,
    classAffinityIds: args.members?.classAffinityIds,
    playableClasses: playableContent.classes,
  })
  const levelConstraints = resolveCharacterLevelConstraints({
    characterKind: args.context.characterKind,
    rulesScope: args.context.rulesScope,
    characterCreationRules: args.context.characterCreationRules,
  })
  const speciesTerm = getContentTypeTerm('species')
  const classTerm = getContentTypeTerm('classes')
  const { values, onApplySetupChange, titles } = args
  const classProgressionApplicable = isClassProgressionApplicable(values.level)
  const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
    membershipTitle: values.membershipTitle,
    titles,
  })
  const levelPrompt = formatQuickNpcLevelRecommendationPrompt({
    membershipTitle: values.membershipTitle,
    titles,
  })

  const sets: CreateSetupSet[] = [
    {
      id: 'speciesId',
      kind: 'choice',
      fieldLabel: speciesTerm.label,
      prompt: speciesPresentation.optionGroups
        ? QUICK_NPC_SPECIES_AFFINITY_PROMPT
        : `What ${speciesTerm.label.toLowerCase()} is this NPC?`,
      options: speciesPresentation.options,
      ...(speciesPresentation.optionGroups
        ? { optionGroups: speciesPresentation.optionGroups }
        : {}),
      value: values.speciesId,
      isComplete: isCreateSetupChoiceComplete(values.speciesId),
      collapseWhenComplete: true,
      onValueChange: (speciesId) => onApplySetupChange('speciesId', speciesId),
      onReset: () => {},
    },
    {
      id: 'membershipTitle',
      kind: 'choice',
      required: false,
      fieldLabel: 'Title',
      prompt: QUICK_NPC_TITLE_FIELD_PROMPT,
      options: buildOrganizationMembershipTitleRadioOptions({ titles }),
      value: values.membershipTitle,
      isComplete: isCreateSetupChoiceComplete(values.membershipTitle),
      collapseWhenComplete: true,
      onValueChange: (membershipTitle) => onApplySetupChange('membershipTitle', membershipTitle),
      onReset: () => {},
    },
  ]

  if (titleRecommendation !== undefined) {
    const templateEntry = getNpcAuthoringTemplateEntry(titleRecommendation.templateId)
    sets.push({
      id: 'recommendedBuild',
      kind: 'note',
      required: false,
      fieldLabel: QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
      body: getNpcAuthoringTemplateLabel(titleRecommendation.templateId),
      ...(templateEntry?.description ? { description: templateEntry.description } : {}),
      isComplete: true,
      onReset: () => {},
    })
  }

  sets.push({
    id: 'level',
    kind: 'number',
    fieldLabel: 'Level',
    ...(levelPrompt ? { prompt: levelPrompt } : {}),
    value: values.level,
    min: levelConstraints.minLevel,
    max: levelConstraints.maxLevel,
    digits: 2,
    dependsOn: ['membershipTitle'],
    isComplete: isCreateSetupNumberComplete(
      values.level,
      levelConstraints.minLevel,
      levelConstraints.maxLevel,
    ),
    collapseWhenComplete: false,
    onValueChange: (level) => onApplySetupChange('level', level),
    onReset: () => {},
  })

  if (classProgressionApplicable) {
    sets.push({
      id: 'classId',
      kind: 'choice',
      fieldLabel: classTerm.label,
      prompt: classPresentation.optionGroups
        ? QUICK_NPC_CLASS_AFFINITY_PROMPT
        : `Choose a ${classTerm.label.toLowerCase()}`,
      options: classPresentation.options,
      ...(classPresentation.optionGroups ? { optionGroups: classPresentation.optionGroups } : {}),
      value: values.classId,
      dependsOn: ['speciesId'],
      isComplete: isCreateSetupChoiceComplete(values.classId),
      collapseWhenComplete: true,
      onValueChange: (classId) => onApplySetupChange('classId', classId),
      onReset: () => {},
    })
  }

  return sets
}

export function resolveQuickNpcSetupModel(args: {
  context: CharacterBuildContext
  values: QuickNpcSetupValues
  titles?: readonly OrganizationMembershipTitleDefinition[]
  members?: { classAffinityIds?: readonly string[]; speciesAffinityIds?: readonly string[] }
}): QuickNpcSetupModel {
  const { speciesOptions, classOptions } = buildQuickNpcContentOptions(args.context)
  const levelConstraints = resolveCharacterLevelConstraints({
    characterKind: args.context.characterKind,
    rulesScope: args.context.rulesScope,
    characterCreationRules: args.context.characterCreationRules,
  })
  const { speciesId, classId, level } = args.values
  const classRequired = isClassProgressionApplicable(level)

  const sets = buildQuickNpcCreateSetupSets({
    context: args.context,
    values: args.values,
    onApplySetupChange: () => {},
    titles: args.titles ?? [],
    members: args.members,
  })
  const canContinue =
    resolveCreateSetupCanContinue({ sets }) &&
    isCreateSetupNumberComplete(level, levelConstraints.minLevel, levelConstraints.maxLevel) &&
    Boolean(speciesId) &&
    (!classRequired || Boolean(classId))

  return {
    speciesOptions,
    classOptions,
    canContinue,
    summaryLine: formatQuickNpcSetupCharacterSummary(args.values, args.context),
  }
}

// Re-export for tests and callers that seed level from title selection.
export { resolveQuickNpcDefaultLevel } from './quick-npc-form-fields'
export { resolveQuickNpcLevelForMembershipTitle } from './quick-npc-setup-value-change.lib'
