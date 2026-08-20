import {
  getContentTypeTerm,
  getNpcAuthoringTemplateEntry,
  isClassProgressionApplicable,
  resolveCharacterLevelConstraints,
  resolvePlayableBuilderContent,
  type CharacterBuildContext,
  type NpcAuthoringTemplateEntry,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { isCreateSetupChoiceComplete } from '@/lib/create-setup'

import {
  buildQuickNpcContentOptions,
  isQuickNpcMembershipTitleSetupComplete,
  isQuickNpcOrganizationMemberSetup,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import type { QuickNpcCreateContext } from './quick-npc-create-context'
import {
  resolveQuickNpcClassOptionGroups,
  type QuickNpcClassOptionGroup,
} from './quick-npc-class-option-groups.lib'
import {
  resolveQuickNpcClassRecommendationIds,
  resolveQuickNpcSelectedTitleRecommendation,
} from './quick-npc-class-recommendation.lib'
import { titleFromMembershipRadioValue } from '../../../components/connections/organization-membership-title-field.lib'

export const QUICK_NPC_BUILD_FIELD_LABEL = 'Build' as const
export const QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL = 'Recommended build' as const
export const QUICK_NPC_BUILD_CHANGE_CLASS_LABEL = 'Change class' as const
export const QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL = 'Change level' as const
export const QUICK_NPC_BUILD_DONE_LABEL = 'Done' as const
export const QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL = 'Choose class' as const
export const QUICK_NPC_BUILD_RECOMMENDED_BADGE_LABEL = 'Recommended' as const
export const QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL = 'Not applicable' as const
export const QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER =
  'Level 0 characters do not select a class.' as const

export type QuickNpcBuildCardMode = 'recommended' | 'build'

export type QuickNpcBuildCardModel = {
  mode: QuickNpcBuildCardMode
  sectionEyebrow: string
  templateLabel?: string
  templateDescription?: string
  classTermLabel: string
  classId: string
  selectedClassLabel?: string
  classOptionGroups: ReturnType<typeof resolveQuickNpcClassOptionGroups>
  recommendedClassIds: readonly string[]
  classRecommendationHelper?: string
  classProgressionApplicable: boolean
  level: number
  levelConstraints: ReturnType<typeof resolveCharacterLevelConstraints>
  levelPrompt?: string
}

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

export function formatQuickNpcClassRecommendationHelper(args: {
  classId: string
  recommendedClassIds: readonly string[]
  classOptions: readonly { value: string; label: string }[]
}): string | undefined {
  if (!args.classId || args.recommendedClassIds.length === 0) {
    return undefined
  }

  if (args.recommendedClassIds.includes(args.classId)) {
    return undefined
  }

  const labelsById = new Map(args.classOptions.map((option) => [option.value, option.label]))
  const recommendedLabels = args.recommendedClassIds.flatMap((classId) => {
    const label = labelsById.get(classId)
    return label ? [label] : []
  })

  if (recommendedLabels.length === 0) {
    return undefined
  }

  return `Recommended: ${recommendedLabels.join(', ')}`
}

/** Setup-phase presentation gate — hides Build while identity choices are reopened. */
export function isQuickNpcBuildCardVisible(args: {
  buildCardModel: QuickNpcBuildCardModel | null
  isEditingUpstream: boolean
}): boolean {
  return args.buildCardModel != null && !args.isEditingUpstream
}

function isQuickNpcBuildCardBlocked(args: {
  createContext: QuickNpcCreateContext
  values: QuickNpcSetupValues
}): boolean {
  if (!isCreateSetupChoiceComplete(args.values.speciesId)) {
    return true
  }

  if (args.createContext.kind === 'organization-member') {
    return (
      !isQuickNpcOrganizationMemberSetup(args.values) ||
      !isQuickNpcMembershipTitleSetupComplete(args.values.membershipTitle)
    )
  }

  return false
}

function resolveQuickNpcBuildCardMembershipTitle(values: QuickNpcSetupValues): string | undefined {
  return isQuickNpcOrganizationMemberSetup(values) ? values.membershipTitle : undefined
}

export function resolveQuickNpcBuildCardModel(args: {
  createContext: QuickNpcCreateContext
  context: CharacterBuildContext
  values: QuickNpcSetupValues
  titles: readonly OrganizationMembershipTitleDefinition[]
  members?: { classAffinityIds?: readonly string[] }
}): QuickNpcBuildCardModel | null {
  const { values, context, titles } = args

  if (isQuickNpcBuildCardBlocked(args)) {
    return null
  }

  const membershipTitle = resolveQuickNpcBuildCardMembershipTitle(values)

  const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
    membershipTitle,
    titles,
  })
  const templateEntry: NpcAuthoringTemplateEntry | undefined =
    titleRecommendation === undefined
      ? undefined
      : getNpcAuthoringTemplateEntry(titleRecommendation.templateId)

  const { classOptions } = buildQuickNpcContentOptions(context)
  const playableContent = resolvePlayableBuilderContent(context)
  const recommendedClassIds = resolveQuickNpcClassRecommendationIds({
    values,
    context,
    titles,
    organizationClassAffinityIds: args.members?.classAffinityIds,
  })
  const classOptionGroups = resolveQuickNpcClassOptionGroups({
    classOptions,
    recommendedClassIds,
    playableClasses: playableContent.classes,
  })
  const classProgressionApplicable = isClassProgressionApplicable(values.level)
  const levelConstraints = resolveCharacterLevelConstraints({
    characterKind: context.characterKind,
    rulesScope: context.rulesScope,
    characterCreationRules: context.characterCreationRules,
  })
  const classTerm = getContentTypeTerm('classes')
  const selectedClassLabel = classOptions.find((option) => option.value === values.classId)?.label

  return {
    mode: titleRecommendation === undefined ? 'build' : 'recommended',
    sectionEyebrow:
      titleRecommendation === undefined
        ? QUICK_NPC_BUILD_FIELD_LABEL
        : QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
    ...(templateEntry
      ? { templateLabel: templateEntry.label, templateDescription: templateEntry.description }
      : {}),
    classTermLabel: classTerm.label,
    classId: values.classId,
    selectedClassLabel,
    classOptionGroups,
    recommendedClassIds,
    classRecommendationHelper: formatQuickNpcClassRecommendationHelper({
      classId: values.classId,
      recommendedClassIds,
      classOptions,
    }),
    classProgressionApplicable,
    level: values.level,
    levelConstraints,
    levelPrompt: formatQuickNpcLevelRecommendationPrompt({
      membershipTitle,
      titles,
    }),
  }
}

export type { QuickNpcClassOptionGroup }
