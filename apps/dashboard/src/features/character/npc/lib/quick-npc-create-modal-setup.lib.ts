import {
  getContentTypeTerm,
  getNpcAuthoringTemplateEntry,
  getNpcAuthoringTemplateLabel,
  indexCharacterBuildCatalog,
  isClassProgressionApplicable,
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

import {
  buildQuickNpcContentOptions,
  isQuickNpcMembershipTitleSetupComplete,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { buildQuickNpcClassRadioCardPresentation } from './quick-npc-class-option-groups.lib'
import {
  resolveQuickNpcClassRecommendationIds,
  resolveQuickNpcSelectedTitleRecommendation,
} from './quick-npc-class-recommendation.lib'
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
  "Recommended from this member's build and organization." as const

export type QuickNpcSetupModel = {
  speciesOptions: ReturnType<typeof buildQuickNpcContentOptions>['speciesOptions']
  classOptions: ReturnType<typeof buildQuickNpcContentOptions>['classOptions']
  canContinue: boolean
  /** Canonical character summary (`formatCharacterSummary`) for the setup selection. */
  summaryLine: string
}

export { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'

export function formatQuickNpcLevelRecommendationPrompt(args: {
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
}): string | undefined {
  if (!isQuickNpcMembershipTitleSetupComplete(args.membershipTitle)) {
    return undefined
  }
  const recommendation = resolveQuickNpcSelectedTitleRecommendation(args)
  if (recommendation === undefined) {
    return undefined
  }
  const persistedTitle = titleFromMembershipRadioValue(args.membershipTitle ?? '')
  if (persistedTitle === undefined) {
    return undefined
  }
  return `Recommended for ${persistedTitle}: Level ${recommendation.level}.`
}

export function formatQuickNpcSetupCharacterSummary(
  values: QuickNpcSetupValues,
  context: CharacterBuildContext,
  titles: readonly OrganizationMembershipTitleDefinition[] = [],
): string {
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const segments = [
    formatBuilderDraftCharacterSummary(
      {
        species: { speciesId: values.speciesId },
        class: {
          classId: isClassProgressionApplicable(values.level) ? values.classId : undefined,
          level: values.level,
        },
      },
      catalogIndex,
    ),
  ]

  const persistedTitle = titleFromMembershipRadioValue(values.membershipTitle ?? '')
  if (persistedTitle !== undefined) {
    segments.push(persistedTitle)
    const recommendation = resolveQuickNpcSelectedTitleRecommendation({
      membershipTitle: values.membershipTitle,
      titles,
    })
    if (recommendation !== undefined) {
      segments.push(getNpcAuthoringTemplateLabel(recommendation.templateId))
    }
  }

  return segments.join(' · ')
}

type QuickNpcSetupSetBuilderArgs = {
  values: QuickNpcSetupValues
  onApplySetupChange: (setId: string, nextValue: string | number) => void
  titles: readonly OrganizationMembershipTitleDefinition[]
  speciesTermLabel: string
  classTermLabel: string
  speciesPresentation: ReturnType<typeof buildQuickNpcSpeciesRadioCardPresentation>
  classPresentation: ReturnType<typeof buildQuickNpcClassRadioCardPresentation>
  levelConstraints: ReturnType<typeof resolveCharacterLevelConstraints>
  levelPrompt: string | undefined
}

function buildQuickNpcSpeciesSetupSet(
  args: Pick<
    QuickNpcSetupSetBuilderArgs,
    'values' | 'onApplySetupChange' | 'speciesTermLabel' | 'speciesPresentation'
  >,
): CreateSetupSet {
  return {
    id: 'speciesId',
    kind: 'choice',
    fieldLabel: args.speciesTermLabel,
    prompt: args.speciesPresentation.optionGroups
      ? QUICK_NPC_SPECIES_AFFINITY_PROMPT
      : `What ${args.speciesTermLabel.toLowerCase()} is this NPC?`,
    options: args.speciesPresentation.options,
    ...(args.speciesPresentation.optionGroups
      ? { optionGroups: args.speciesPresentation.optionGroups }
      : {}),
    value: args.values.speciesId,
    visibleWhenComplete: ['membershipTitle'],
    isComplete: isCreateSetupChoiceComplete(args.values.speciesId),
    collapseWhenComplete: true,
    onValueChange: (speciesId) => args.onApplySetupChange('speciesId', speciesId),
    onReset: () => {},
  }
}

function buildQuickNpcMembershipTitleSetupSet(
  args: Pick<QuickNpcSetupSetBuilderArgs, 'values' | 'onApplySetupChange' | 'titles'>,
): CreateSetupSet {
  return {
    id: 'membershipTitle',
    kind: 'choice',
    required: false,
    fieldLabel: 'Title',
    prompt: QUICK_NPC_TITLE_FIELD_PROMPT,
    options: buildOrganizationMembershipTitleRadioOptions({ titles: args.titles }),
    value: args.values.membershipTitle ?? '',
    isComplete: isQuickNpcMembershipTitleSetupComplete(args.values.membershipTitle),
    collapseWhenComplete: true,
    onValueChange: (membershipTitle) => args.onApplySetupChange('membershipTitle', membershipTitle),
    onReset: () => {},
  }
}

function buildQuickNpcRecommendedBuildSetupSet(
  recommendation: NonNullable<ReturnType<typeof resolveQuickNpcSelectedTitleRecommendation>>,
): CreateSetupSet {
  const templateEntry = getNpcAuthoringTemplateEntry(recommendation.templateId)
  return {
    id: 'recommendedBuild',
    kind: 'note',
    required: false,
    fieldLabel: QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
    body: getNpcAuthoringTemplateLabel(recommendation.templateId),
    ...(templateEntry?.description ? { description: templateEntry.description } : {}),
    visibleWhenComplete: ['speciesId'],
    isComplete: true,
    onReset: () => {},
  }
}

function buildQuickNpcLevelSetupSet(
  args: Pick<
    QuickNpcSetupSetBuilderArgs,
    'values' | 'onApplySetupChange' | 'levelConstraints' | 'levelPrompt'
  >,
): CreateSetupSet {
  return {
    id: 'level',
    kind: 'number',
    fieldLabel: 'Level',
    ...(args.levelPrompt ? { prompt: args.levelPrompt } : {}),
    value: args.values.level,
    min: args.levelConstraints.minLevel,
    max: args.levelConstraints.maxLevel,
    digits: 2,
    visibleWhenComplete: ['speciesId'],
    isComplete: isCreateSetupNumberComplete(
      args.values.level,
      args.levelConstraints.minLevel,
      args.levelConstraints.maxLevel,
    ),
    collapseWhenComplete: false,
    onValueChange: (level) => args.onApplySetupChange('level', level),
    onReset: () => {},
  }
}

function buildQuickNpcClassSetupSet(
  args: Pick<
    QuickNpcSetupSetBuilderArgs,
    'values' | 'onApplySetupChange' | 'classTermLabel' | 'classPresentation'
  >,
): CreateSetupSet {
  return {
    id: 'classId',
    kind: 'choice',
    fieldLabel: args.classTermLabel,
    prompt: args.classPresentation.optionGroups
      ? QUICK_NPC_CLASS_AFFINITY_PROMPT
      : `Choose a ${args.classTermLabel.toLowerCase()}`,
    options: args.classPresentation.options,
    ...(args.classPresentation.optionGroups
      ? { optionGroups: args.classPresentation.optionGroups }
      : {}),
    value: args.values.classId,
    visibleWhenComplete: ['speciesId'],
    dependsOn: ['speciesId'],
    isComplete: isCreateSetupChoiceComplete(args.values.classId),
    collapseWhenComplete: true,
    collapseWhenActiveAndComplete: true,
    onValueChange: (classId) => args.onApplySetupChange('classId', classId),
    onReset: () => {},
  }
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
  const { values, onApplySetupChange, titles } = args
  const speciesPresentation = buildQuickNpcSpeciesRadioCardPresentation({
    speciesOptions,
    speciesAffinityIds: args.members?.speciesAffinityIds,
    playableSpecies: playableContent.species,
  })
  const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
    membershipTitle: values.membershipTitle,
    titles,
  })
  const recommendedClassIds = resolveQuickNpcClassRecommendationIds({
    values,
    context: args.context,
    titles,
    organizationClassAffinityIds: args.members?.classAffinityIds,
  })
  const classPresentation = buildQuickNpcClassRadioCardPresentation({
    classOptions,
    recommendedClassIds,
    playableClasses: playableContent.classes,
  })
  const levelConstraints = resolveCharacterLevelConstraints({
    characterKind: args.context.characterKind,
    rulesScope: args.context.rulesScope,
    characterCreationRules: args.context.characterCreationRules,
  })
  const speciesTerm = getContentTypeTerm('species')
  const classTerm = getContentTypeTerm('classes')
  const classProgressionApplicable = isClassProgressionApplicable(values.level)
  const levelPrompt = formatQuickNpcLevelRecommendationPrompt({
    membershipTitle: values.membershipTitle,
    titles,
  })
  const setBuilderArgs: QuickNpcSetupSetBuilderArgs = {
    values,
    onApplySetupChange,
    titles,
    speciesTermLabel: speciesTerm.label,
    classTermLabel: classTerm.label,
    speciesPresentation,
    classPresentation,
    levelConstraints,
    levelPrompt,
  }

  const sets: CreateSetupSet[] = [
    buildQuickNpcMembershipTitleSetupSet(setBuilderArgs),
    buildQuickNpcSpeciesSetupSet(setBuilderArgs),
  ]

  if (titleRecommendation !== undefined) {
    sets.push(buildQuickNpcRecommendedBuildSetupSet(titleRecommendation))
  }

  sets.push(buildQuickNpcLevelSetupSet(setBuilderArgs))

  if (classProgressionApplicable) {
    sets.push(buildQuickNpcClassSetupSet(setBuilderArgs))
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
    isQuickNpcMembershipTitleSetupComplete(args.values.membershipTitle) &&
    isCreateSetupNumberComplete(level, levelConstraints.minLevel, levelConstraints.maxLevel) &&
    Boolean(speciesId) &&
    (!classRequired || Boolean(classId))

  return {
    speciesOptions,
    classOptions,
    canContinue,
    summaryLine: formatQuickNpcSetupCharacterSummary(args.values, args.context, args.titles ?? []),
  }
}

// Re-export for tests and callers that seed level from title selection.
export { resolveQuickNpcDefaultLevel } from './quick-npc-form-fields'
export { resolveQuickNpcLevelForMembershipTitle } from './quick-npc-setup-value-change.lib'
