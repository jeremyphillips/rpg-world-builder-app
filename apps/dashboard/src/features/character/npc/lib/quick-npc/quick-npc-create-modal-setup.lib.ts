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

import { buildOrganizationMembershipTitleRadioOptions } from '../../../components/connections/organization-membership-title-field.lib'
import {
  isCreateSetupChoiceComplete,
  type CreateSetupExternalDecision,
  type CreateSetupSet,
  type SetupSummaryRowModel,
} from '@/lib/create-setup'

import type { QuickNpcCreateContext } from './quick-npc-create-context'
import {
  buildQuickNpcContentOptions,
  isQuickNpcMembershipTitleSetupComplete,
  isQuickNpcOrganizationMemberSetup,
  type QuickNpcOrganizationMemberSetupValues,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { buildQuickNpcSpeciesRadioCardPresentation } from './quick-npc-species-option-groups.lib'
import { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'

export const QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE = 'Set up member' as const
export const QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION =
  "Choose the member's role and starting character options. Recommendations come from this organization and can be changed before creation." as const
export const QUICK_NPC_STANDALONE_SETUP_HEADLINE = 'Set up NPC' as const
export const QUICK_NPC_STANDALONE_SETUP_DESCRIPTION =
  'Choose species and starting character options.' as const
export const QUICK_NPC_SETUP_HEADLINE = QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE
export const QUICK_NPC_SETUP_CHANGE_LABEL = 'Change' as const
export const QUICK_NPC_SETUP_SELECTIONS_EYEBROW = 'Selections' as const
export const QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP = 'selections' as const
export const QUICK_NPC_SETUP_SUMMARY_EYEBROW = 'Setup' as const
export const QUICK_NPC_AUTHORING_SETUP_ROLE_LABEL = 'Role' as const
export const QUICK_NPC_AUTHORING_SETUP_SPECIES_LABEL = 'Species' as const
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
  if (values.contextKind === 'standalone') {
    return [values.speciesId, String(values.level), values.classId].join(':')
  }

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

export type QuickNpcAuthoringSetupSummaryRow = SetupSummaryRowModel

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

function resolveQuickNpcSpeciesDisplayLabel(
  speciesId: string,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): string {
  return catalogIndex.species.get(speciesId)?.name ?? speciesId
}

function resolveQuickNpcClassDisplayLabel(
  classId: string | undefined,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): string | undefined {
  if (!classId) return undefined
  return catalogIndex.classes.get(classId)?.name ?? classId
}

function formatQuickNpcAuthoringBuildSummaryValue(args: {
  values: QuickNpcSetupValues
  titles: readonly OrganizationMembershipTitleDefinition[]
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>
}): string {
  const parts: string[] = []
  if (isQuickNpcOrganizationMemberSetup(args.values)) {
    const recommendation = resolveQuickNpcSelectedTitleRecommendation({
      membershipTitle: args.values.membershipTitle,
      titles: args.titles,
    })
    if (recommendation !== undefined) {
      parts.push(getNpcAuthoringTemplateLabel(recommendation.templateId))
    }
  }

  const className = resolveQuickNpcClassDisplayLabel(args.values.classId, args.catalogIndex)
  if (isClassProgressionApplicable(args.values.level) && className) {
    parts.push(`Level ${args.values.level} ${className}`)
  } else {
    parts.push(`Level ${args.values.level}`)
  }

  return parts.join(' · ')
}

/** Structured Role / Species / Build rows for authoring-phase SelectionSummaryCard. */
export function resolveQuickNpcSetupSummaryRows(args: {
  createContext: QuickNpcCreateContext
  values: QuickNpcSetupValues
  context: CharacterBuildContext
  titles?: readonly OrganizationMembershipTitleDefinition[]
}): QuickNpcAuthoringSetupSummaryRow[] {
  const titles = args.titles ?? []
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const rows: QuickNpcAuthoringSetupSummaryRow[] = []

  if (args.createContext.kind === 'organization-member') {
    rows.push({
      id: 'membershipTitle',
      label: QUICK_NPC_AUTHORING_SETUP_ROLE_LABEL,
      value: resolveQuickNpcMembershipTitleDisplayLabel(
        isQuickNpcOrganizationMemberSetup(args.values) ? args.values.membershipTitle : undefined,
        titles,
      ),
      editTarget: { type: 'set', id: 'membershipTitle' },
    })
  }

  rows.push(
    {
      id: 'speciesId',
      label: QUICK_NPC_AUTHORING_SETUP_SPECIES_LABEL,
      value: resolveQuickNpcSpeciesDisplayLabel(args.values.speciesId, catalogIndex),
      editTarget: { type: 'set', id: 'speciesId' },
    },
    {
      id: QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
      label: QUICK_NPC_AUTHORING_SETUP_BUILD_LABEL,
      value: formatQuickNpcAuthoringBuildSummaryValue({
        values: args.values,
        titles,
        catalogIndex,
      }),
      editTarget: { type: 'external', id: QUICK_NPC_BUILD_EXTERNAL_DECISION_ID },
    },
  )

  return rows
}

type QuickNpcSetupSetBuilderArgs = {
  values: QuickNpcSetupValues
  titles: readonly OrganizationMembershipTitleDefinition[]
  speciesTermLabel: string
  speciesPresentation: ReturnType<typeof buildQuickNpcSpeciesRadioCardPresentation>
}

function buildQuickNpcSpeciesSetupSet(
  args: Pick<QuickNpcSetupSetBuilderArgs, 'values' | 'speciesTermLabel' | 'speciesPresentation'> & {
    gateOnMembershipTitle: boolean
  },
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
    ...(args.gateOnMembershipTitle ? { visibleWhenComplete: ['membershipTitle'] as const } : {}),
    summaryGroup: QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP,
    summaryGroupEyebrow: QUICK_NPC_SETUP_SELECTIONS_EYEBROW,
    isComplete: isCreateSetupChoiceComplete(args.values.speciesId),
  }
}

function buildQuickNpcMembershipTitleSetupSet(args: {
  values: QuickNpcOrganizationMemberSetupValues
  titles: readonly OrganizationMembershipTitleDefinition[]
}): CreateSetupSet {
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
  createContext: QuickNpcCreateContext
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

  if (args.createContext.kind === 'standalone') {
    return [
      buildQuickNpcSpeciesSetupSet({
        ...setBuilderArgs,
        gateOnMembershipTitle: false,
      }),
    ]
  }

  return [
    buildQuickNpcMembershipTitleSetupSet({
      values: values as QuickNpcOrganizationMemberSetupValues,
      titles,
    }),
    buildQuickNpcSpeciesSetupSet({
      ...setBuilderArgs,
      gateOnMembershipTitle: true,
    }),
  ]
}

export function resolveQuickNpcSetupModel(args: {
  createContext: QuickNpcCreateContext
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
