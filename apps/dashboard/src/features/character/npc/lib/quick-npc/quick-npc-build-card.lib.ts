import {
  getContentTypeTerm,
  getNpcTemplateEntry,
  getNpcTemplateLabel,
  isClassProgressionApplicable,
  resolveCharacterLevelConstraints,
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
import { resolveQuickNpcClassRecommendationIds } from './quick-npc-class-recommendation.lib'
import { resolveQuickNpcSuggestedNpcTemplateId } from './quick-npc-suggested-npc-template.lib'
import {
  QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER,
  resolveQuickNpcClassRowHelper,
  resolveQuickNpcLevelRowHelper,
  resolveQuickNpcRoleRowHelper,
} from './quick-npc-build-provenance.lib'

export const QUICK_NPC_BUILD_FIELD_LABEL = 'Build' as const
export const QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL = 'Recommended build' as const
export const QUICK_NPC_BUILD_CHANGE_CLASS_LABEL = 'Change class' as const
export const QUICK_NPC_BUILD_CHANGE_ROLE_LABEL = 'Change role' as const
export const QUICK_NPC_BUILD_DONE_LABEL = 'Done' as const
export const QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL = 'Choose class' as const

export type QuickNpcBuildCardExpandActionKind = 'role' | 'class'

const QUICK_NPC_BUILD_EXPAND_ACTION_CHANGE_LABELS = {
  role: QUICK_NPC_BUILD_CHANGE_ROLE_LABEL,
  class: QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
} as const satisfies Record<QuickNpcBuildCardExpandActionKind, string>

/** Collapsed → “Change …”; expanded → “Done” for role and class row actions. */
export function resolveQuickNpcBuildCardExpandActionLabel(
  kind: QuickNpcBuildCardExpandActionKind,
  expanded: boolean,
): string {
  return expanded ? QUICK_NPC_BUILD_DONE_LABEL : QUICK_NPC_BUILD_EXPAND_ACTION_CHANGE_LABELS[kind]
}

export const QUICK_NPC_BUILD_CHOOSE_ROLE_LABEL = 'Choose role' as const
export const QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL = 'Not applicable' as const

export { QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER }

export type QuickNpcBuildCardMode = 'recommended' | 'build'

export type QuickNpcBuildCardRoleRow = {
  npcTemplateId: string
  selectedRoleLabel: string
  roleOptionPresentation: ReturnType<typeof buildQuickNpcRoleRadioCardPresentation>
  helper?: string
}

export type QuickNpcBuildCardLevelRow = {
  level: number
  levelConstraints: ReturnType<typeof resolveCharacterLevelConstraints>
  helper?: string
}

export type QuickNpcBuildCardClassRow = {
  termLabel: string
  classId: string
  selectedClassLabel?: string
  classOptionPresentation: ReturnType<typeof buildQuickNpcClassRadioCardPresentation>
  recommendedClassIds: readonly string[]
  classProgressionApplicable: boolean
  helper?: string
}

export type QuickNpcBuildCardModel = {
  mode: QuickNpcBuildCardMode
  sectionEyebrow: string
  showTemplateIdentity: boolean
  templateLabel?: string
  templateDescription?: string
  roleRow?: QuickNpcBuildCardRoleRow
  levelRow: QuickNpcBuildCardLevelRow
  classRow: QuickNpcBuildCardClassRow
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
          helper: resolveQuickNpcRoleRowHelper({
            selectedTemplateId,
            membershipTitle,
            titles,
            organizationName: args.organizationName,
            organizationTemplateId: args.members?.npcTemplateId,
          }),
        }
      : undefined

  const classHelper = classProgressionApplicable
    ? resolveQuickNpcClassRowHelper({
        classId: values.classId,
        membershipTitle,
        titles,
        selectedTemplateId,
        organizationName: args.organizationName,
        organizationClassAffinityIds: args.members?.classAffinityIds,
        context,
        classOptions,
        setup: values,
      })
    : QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER

  return {
    mode: hasTemplateIdentity ? 'recommended' : 'build',
    sectionEyebrow:
      createContext.kind === 'standalone'
        ? QUICK_NPC_BUILD_FIELD_LABEL
        : hasTemplateIdentity
          ? QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL
          : QUICK_NPC_BUILD_FIELD_LABEL,
    showTemplateIdentity,
    ...(showTemplateIdentity && templateEntry
      ? { templateLabel: templateEntry.label, templateDescription: templateEntry.description }
      : {}),
    ...(roleRow ? { roleRow } : {}),
    levelRow: {
      level: values.level,
      levelConstraints,
      helper: resolveQuickNpcLevelRowHelper({
        level: values.level,
        membershipTitle,
        titles,
      }),
    },
    classRow: {
      termLabel: classTerm.label,
      classId: values.classId,
      selectedClassLabel,
      classOptionPresentation,
      recommendedClassIds,
      classProgressionApplicable,
      helper: classHelper,
    },
  }
}

export type { QuickNpcClassOptionGroup }
