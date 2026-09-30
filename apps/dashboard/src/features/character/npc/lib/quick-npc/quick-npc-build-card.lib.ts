import {
  getContentTypeTerm,
  getNpcTemplateEntry,
  getNpcTemplateLabel,
  isClassProgressionApplicable,
  resolveCharacterLevelConstraints,
  resolveOrganizationMembershipTitleProjection,
  resolvePlayableBuilderContent,
  type CharacterBuildContext,
  type NpcTemplateId,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'
import { isCreateSetupChoiceComplete } from '@/lib/create-setup'

import {
  buildQuickNpcContentOptions,
  isQuickNpcMembershipTitleSetupComplete,
  isQuickNpcOrganizationMemberSetup,
  isQuickNpcStandaloneSetup,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import type { QuickNpcCreateContext } from './quick-npc-create-context'
import {
  buildQuickNpcClassRadioCardPresentation,
  type QuickNpcClassOptionGroup,
} from './quick-npc-class-option-groups.lib'
import { buildQuickNpcRoleRadioCardPresentation } from './quick-npc-npc-template-option.lib'
import {
  resolveQuickNpcClassRecommendationIds,
  resolveQuickNpcSelectedTitleRecommendation,
} from './quick-npc-class-recommendation.lib'
import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'
import { resolveQuickNpcSuggestedNpcTemplateId } from './quick-npc-suggested-npc-template.lib'
import { resolveQuickNpcNpcTemplateSuggestionSourceLabel } from './quick-npc-role-provenance.lib'

export const QUICK_NPC_BUILD_FIELD_LABEL = 'Build' as const
export const QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL = 'Recommended build' as const
export const QUICK_NPC_BUILD_CHANGE_CLASS_LABEL = 'Change class' as const
export const QUICK_NPC_BUILD_CHANGE_ROLE_LABEL = 'Change role' as const
export const QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL = 'Change level' as const
export const QUICK_NPC_BUILD_DONE_LABEL = 'Done' as const
export const QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL = 'Choose class' as const

export type QuickNpcBuildCardExpandActionKind = 'role' | 'class' | 'level'

const QUICK_NPC_BUILD_EXPAND_ACTION_CHANGE_LABELS = {
  role: QUICK_NPC_BUILD_CHANGE_ROLE_LABEL,
  class: QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
  level: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL,
} as const satisfies Record<QuickNpcBuildCardExpandActionKind, string>

/** Collapsed → “Change …”; expanded → “Done” for role, class, and level row actions. */
export function resolveQuickNpcBuildCardExpandActionLabel(
  kind: QuickNpcBuildCardExpandActionKind,
  expanded: boolean,
): string {
  return expanded ? QUICK_NPC_BUILD_DONE_LABEL : QUICK_NPC_BUILD_EXPAND_ACTION_CHANGE_LABELS[kind]
}
export const QUICK_NPC_BUILD_CHOOSE_ROLE_LABEL = 'Choose role' as const
export const QUICK_NPC_BUILD_RECOMMENDED_BADGE_LABEL = 'Recommended' as const
export const QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL = 'Not applicable' as const
export const QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER =
  'Level 0 characters do not select a class.' as const

export type QuickNpcBuildCardMode = 'recommended' | 'build'

export type QuickNpcBuildCardRoleRow = {
  npcTemplateId: string
  selectedRoleLabel: string
  roleOptionPresentation: ReturnType<typeof buildQuickNpcRoleRadioCardPresentation>
  roleProvenanceHelper?: string
}

export type QuickNpcBuildCardModel = {
  mode: QuickNpcBuildCardMode
  sectionEyebrow: string
  showTemplateIdentity: boolean
  templateLabel?: string
  templateDescription?: string
  roleRow?: QuickNpcBuildCardRoleRow
  classTermLabel: string
  classId: string
  selectedClassLabel?: string
  classOptionPresentation: ReturnType<typeof buildQuickNpcClassRadioCardPresentation>
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
  if (recommendation?.level === undefined) {
    return undefined
  }
  const membershipTitleId = titleFromMembershipRadioValue(args.membershipTitle ?? '')
  if (membershipTitleId === undefined) {
    return undefined
  }
  const projection = resolveOrganizationMembershipTitleProjection({
    catalog: args.titles,
    membershipTitleId,
  })
  if (projection.status !== 'resolved') {
    return undefined
  }
  return `Recommended for ${projection.label}: Level ${recommendation.level}.`
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

  if (args.createContext.kind === 'standalone') {
    return (
      !isQuickNpcStandaloneSetup(args.values) ||
      !isCreateSetupChoiceComplete(args.values.npcTemplateId)
    )
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

// fallow-ignore-next-line complexity
export function resolveQuickNpcBuildCardModel(args: {
  createContext: QuickNpcCreateContext
  context: CharacterBuildContext
  values: QuickNpcSetupValues
  titles: readonly OrganizationMembershipTitleDefinition[]
  members?: { classAffinityIds?: readonly string[]; npcTemplateId?: NpcTemplateId }
  organizationName?: string
}): QuickNpcBuildCardModel | null {
  const { values, context, titles, createContext } = args

  if (isQuickNpcBuildCardBlocked(args)) {
    return null
  }

  const membershipTitle = resolveQuickNpcBuildCardMembershipTitle(values)

  const selectedTemplateId = values.npcTemplateId
  const templateEntry = selectedTemplateId ? getNpcTemplateEntry(selectedTemplateId) : undefined
  const suggestedTemplateId = isQuickNpcOrganizationMemberSetup(values)
    ? resolveQuickNpcSuggestedNpcTemplateId({
        membershipTitle,
        titles,
        organizationTemplateId: args.members?.npcTemplateId,
      })
    : undefined
  const suggestionSourceLabel = isQuickNpcOrganizationMemberSetup(values)
    ? resolveQuickNpcNpcTemplateSuggestionSourceLabel({
        membershipTitle,
        titles,
        organizationName: args.organizationName,
        organizationTemplateId: args.members?.npcTemplateId,
        suggestedTemplateId,
        selectedTemplateId,
      })
    : undefined

  const { classOptions } = buildQuickNpcContentOptions(context)
  const playableContent = resolvePlayableBuilderContent(context)
  const recommendedClassIds = resolveQuickNpcClassRecommendationIds({
    values,
    context,
    titles,
    organizationClassAffinityIds: args.members?.classAffinityIds,
    organizationTemplateId: args.members?.npcTemplateId,
  })
  const classOptionPresentation = buildQuickNpcClassRadioCardPresentation({
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

  const hasTemplateIdentity = templateEntry !== undefined
  const showTemplateIdentity = createContext.kind === 'standalone' && hasTemplateIdentity
  const roleRow: QuickNpcBuildCardRoleRow | undefined =
    createContext.kind === 'organization-member'
      ? {
          npcTemplateId: selectedTemplateId ?? '',
          selectedRoleLabel: selectedTemplateId
            ? getNpcTemplateLabel(selectedTemplateId)
            : QUICK_NPC_BUILD_CHOOSE_ROLE_LABEL,
          roleOptionPresentation: buildQuickNpcRoleRadioCardPresentation(suggestedTemplateId),
          ...(suggestionSourceLabel
            ? { roleProvenanceHelper: `Suggested by ${suggestionSourceLabel}` }
            : {}),
        }
      : undefined

  return {
    mode: hasTemplateIdentity ? 'recommended' : 'build',
    sectionEyebrow: hasTemplateIdentity
      ? QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL
      : QUICK_NPC_BUILD_FIELD_LABEL,
    showTemplateIdentity,
    ...(showTemplateIdentity && templateEntry
      ? { templateLabel: templateEntry.label, templateDescription: templateEntry.description }
      : {}),
    ...(roleRow ? { roleRow } : {}),
    classTermLabel: classTerm.label,
    classId: values.classId,
    selectedClassLabel,
    classOptionPresentation,
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
