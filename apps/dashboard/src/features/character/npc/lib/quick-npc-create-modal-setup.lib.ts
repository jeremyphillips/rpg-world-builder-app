import {
  getContentTypeTerm,
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
import { buildQuickNpcSpeciesRadioCardPresentation } from './quick-npc-species-option-groups.lib'
import { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'

export const QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE = 'Set up member' as const
export const QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION =
  "Choose the member's role and starting character options. Recommendations come from this organization and can be changed before creation." as const
export const QUICK_NPC_SETUP_HEADLINE = QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE
export const QUICK_NPC_SETUP_CHANGE_LABEL = 'Change' as const
export const QUICK_NPC_SETUP_SUMMARY_EYEBROW = 'Setup' as const
export const QUICK_NPC_TITLE_FIELD_PROMPT =
  "Choose this member's role in the organization." as const
export {
  QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
  QUICK_NPC_BUILD_FIELD_LABEL,
} from './quick-npc-build-card.lib'
export const QUICK_NPC_SPECIES_AFFINITY_PROMPT =
  "Recommended species are based on this organization's member affinities." as const

export type QuickNpcSetupModel = {
  speciesOptions: ReturnType<typeof buildQuickNpcContentOptions>['speciesOptions']
  classOptions: ReturnType<typeof buildQuickNpcContentOptions>['classOptions']
  canContinue: boolean
  /** Canonical character summary (`formatCharacterSummary`) for the setup selection. */
  summaryLine: string
}

export {
  formatQuickNpcLevelRecommendationPrompt,
  resolveQuickNpcBuildCardModel,
  QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
  QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL,
  QUICK_NPC_BUILD_DONE_LABEL,
  QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL,
  QUICK_NPC_BUILD_RECOMMENDED_BADGE_LABEL,
} from './quick-npc-build-card.lib'
export { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'
export type { QuickNpcBuildCardModel } from './quick-npc-build-card.lib'

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
  speciesPresentation: ReturnType<typeof buildQuickNpcSpeciesRadioCardPresentation>
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

export function buildQuickNpcCreateSetupSets(args: {
  context: CharacterBuildContext
  values: QuickNpcSetupValues
  onApplySetupChange: (setId: string, nextValue: string | number) => void
  titles: readonly OrganizationMembershipTitleDefinition[]
  members?: { classAffinityIds?: readonly string[]; speciesAffinityIds?: readonly string[] }
}): CreateSetupSet[] {
  const { speciesOptions } = buildQuickNpcContentOptions(args.context)
  const playableContent = resolvePlayableBuilderContent(args.context)
  const { values, onApplySetupChange, titles } = args
  const speciesPresentation = buildQuickNpcSpeciesRadioCardPresentation({
    speciesOptions,
    speciesAffinityIds: args.members?.speciesAffinityIds,
    playableSpecies: playableContent.species,
  })
  const speciesTerm = getContentTypeTerm('species')
  const setBuilderArgs: QuickNpcSetupSetBuilderArgs = {
    values,
    onApplySetupChange,
    titles,
    speciesTermLabel: speciesTerm.label,
    speciesPresentation,
  }

  return [
    buildQuickNpcMembershipTitleSetupSet(setBuilderArgs),
    buildQuickNpcSpeciesSetupSet(setBuilderArgs),
  ]
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
