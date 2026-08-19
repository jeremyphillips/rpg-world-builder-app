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
import { buildOrganizationMembershipTitleRadioOptions } from '../../components/connections/organization-membership-title-field.lib'
import {
  isCreateSetupChoiceComplete,
  type CreateSetupExternalDecision,
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
export const QUICK_NPC_SETUP_SELECTIONS_EYEBROW = 'Selections' as const
export const QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP = 'selections' as const
export const QUICK_NPC_SETUP_SUMMARY_EYEBROW = 'Setup' as const
export const QUICK_NPC_AUTHORING_SETUP_ROLE_LABEL = 'Role' as const
export const QUICK_NPC_AUTHORING_SETUP_CHARACTER_LABEL = 'Character' as const
export const QUICK_NPC_AUTHORING_SETUP_BUILD_LABEL = 'Build' as const
export const QUICK_NPC_AUTHORING_SETUP_CHANGE_ARIA_LABEL = 'Change setup' as const
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
}

export const QUICK_NPC_BUILD_EXTERNAL_DECISION_ID = 'quickNpcBuild' as const

export function quickNpcBuildRevision(values: QuickNpcSetupValues): string {
  return [
    values.membershipTitle ?? '',
    values.speciesId,
    String(values.level),
    values.classId,
  ].join(':')
}

function isQuickNpcLevelResolved(
  level: number,
  constraints: ReturnType<typeof resolveCharacterLevelConstraints>,
): boolean {
  return Number.isInteger(level) && level >= constraints.minLevel && level <= constraints.maxLevel
}

export function isQuickNpcBuildResolved(args: {
  values: QuickNpcSetupValues
  context: CharacterBuildContext
}): boolean {
  const levelConstraints = resolveCharacterLevelConstraints({
    characterKind: args.context.characterKind,
    rulesScope: args.context.rulesScope,
    characterCreationRules: args.context.characterCreationRules,
  })
  const classRequired = isClassProgressionApplicable(args.values.level)

  return (
    isQuickNpcLevelResolved(args.values.level, levelConstraints) &&
    (!classRequired || Boolean(args.values.classId))
  )
}

export function resolveQuickNpcBuildExternalDecision(args: {
  values: QuickNpcSetupValues
  context: CharacterBuildContext
}): CreateSetupExternalDecision {
  return {
    id: QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
    isResolved: isQuickNpcBuildResolved(args),
    completion: 'explicit',
    revision: quickNpcBuildRevision(args.values),
    completeLabel: 'Continue',
  }
}

export {
  formatQuickNpcLevelRecommendationPrompt,
  isQuickNpcBuildCardVisible,
  resolveQuickNpcBuildCardModel,
  QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
  QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL,
  QUICK_NPC_BUILD_DONE_LABEL,
  QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL,
  QUICK_NPC_BUILD_RECOMMENDED_BADGE_LABEL,
} from './quick-npc-build-card.lib'
export { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'
export type { QuickNpcBuildCardModel } from './quick-npc-build-card.lib'

export type QuickNpcAuthoringSetupSummaryRow = {
  label: string
  value: string
}

export function resolveQuickNpcMembershipTitleDisplayLabel(
  membershipTitle: string | undefined,
  titles: readonly OrganizationMembershipTitleDefinition[] = [],
): string {
  const value = membershipTitle ?? ''
  const selected = buildOrganizationMembershipTitleRadioOptions({ titles }).find(
    (option) => option.value === value,
  )
  return selected?.label ?? value
}

/** Structured Role / Character / Build rows for authoring-phase SetupSummaryCard. */
export function resolveQuickNpcSetupSummaryRows(args: {
  values: QuickNpcSetupValues
  context: CharacterBuildContext
  titles?: readonly OrganizationMembershipTitleDefinition[]
}): QuickNpcAuthoringSetupSummaryRow[] {
  const titles = args.titles ?? []
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const rows: QuickNpcAuthoringSetupSummaryRow[] = [
    {
      label: QUICK_NPC_AUTHORING_SETUP_ROLE_LABEL,
      value: resolveQuickNpcMembershipTitleDisplayLabel(args.values.membershipTitle, titles),
    },
    {
      label: QUICK_NPC_AUTHORING_SETUP_CHARACTER_LABEL,
      value: formatBuilderDraftCharacterSummary(
        {
          species: { speciesId: args.values.speciesId },
          class: {
            classId: isClassProgressionApplicable(args.values.level)
              ? args.values.classId
              : undefined,
            level: args.values.level,
          },
        },
        catalogIndex,
      ),
    },
  ]

  const recommendation = resolveQuickNpcSelectedTitleRecommendation({
    membershipTitle: args.values.membershipTitle,
    titles,
  })
  if (recommendation !== undefined) {
    rows.push({
      label: QUICK_NPC_AUTHORING_SETUP_BUILD_LABEL,
      value: getNpcAuthoringTemplateLabel(recommendation.templateId),
    })
  }

  return rows
}

type QuickNpcSetupSetBuilderArgs = {
  values: QuickNpcSetupValues
  titles: readonly OrganizationMembershipTitleDefinition[]
  speciesTermLabel: string
  speciesPresentation: ReturnType<typeof buildQuickNpcSpeciesRadioCardPresentation>
}

function buildQuickNpcSpeciesSetupSet(
  args: Pick<QuickNpcSetupSetBuilderArgs, 'values' | 'speciesTermLabel' | 'speciesPresentation'>,
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
    summaryGroup: QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP,
    summaryGroupEyebrow: QUICK_NPC_SETUP_SELECTIONS_EYEBROW,
    isComplete: isCreateSetupChoiceComplete(args.values.speciesId),
  }
}

function buildQuickNpcMembershipTitleSetupSet(
  args: Pick<QuickNpcSetupSetBuilderArgs, 'values' | 'titles'>,
): CreateSetupSet {
  return {
    id: 'membershipTitle',
    kind: 'choice',
    required: false,
    fieldLabel: 'Title',
    prompt: QUICK_NPC_TITLE_FIELD_PROMPT,
    options: buildOrganizationMembershipTitleRadioOptions({ titles: args.titles }),
    value: args.values.membershipTitle ?? '',
    summaryGroup: QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP,
    summaryGroupEyebrow: QUICK_NPC_SETUP_SELECTIONS_EYEBROW,
    isComplete: isQuickNpcMembershipTitleSetupComplete(args.values.membershipTitle),
  }
}

export function buildQuickNpcCreateSetupSets(args: {
  context: CharacterBuildContext
  values: QuickNpcSetupValues
  titles: readonly OrganizationMembershipTitleDefinition[]
  members?: { classAffinityIds?: readonly string[]; speciesAffinityIds?: readonly string[] }
}): CreateSetupSet[] {
  const { speciesOptions } = buildQuickNpcContentOptions(args.context)
  const playableContent = resolvePlayableBuilderContent(args.context)
  const { values, titles } = args
  const speciesPresentation = buildQuickNpcSpeciesRadioCardPresentation({
    speciesOptions,
    speciesAffinityIds: args.members?.speciesAffinityIds,
    playableSpecies: playableContent.species,
  })
  const speciesTerm = getContentTypeTerm('species')
  const setBuilderArgs: QuickNpcSetupSetBuilderArgs = {
    values,
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

  return {
    speciesOptions,
    classOptions,
  }
}

// Re-export for tests and callers that seed level from title selection.
export { resolveQuickNpcDefaultLevel } from './quick-npc-form-fields'
export { resolveQuickNpcLevelForMembershipTitle } from './quick-npc-setup-value-change.lib'
