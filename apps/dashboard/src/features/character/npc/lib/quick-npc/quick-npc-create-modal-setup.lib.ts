import {
  getContentTypeTerm,
  getNpcTemplateLabel,
  indexCharacterBuildCatalog,
  isClassProgressionApplicable,
  resolvePlayableBuilderContent,
  resolveCharacterLevelConstraints,
  type CharacterBuildContext,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { buildOrganizationMembershipTitleRadioOptions } from '../../../lib/organization-membership/organization-membership-title.lib'
import {
  isCreateSetupChoiceComplete,
  resolveCreateSetupFooterActions,
  resolveCreateSetupSequenceSetIds,
  resolveSetupSummaryRows,
  type CreateSetupExternalDecision,
  type CreateSetupFooterAction,
  type CreateSetupSet,
  type CreateSetupSummaryDefinition,
  type SetupSummaryRow,
} from '@/lib/create-setup'

import { QUICK_NPC_PREVIEW_NPC_LABEL } from './quick-npc-preview-copy'

import type { QuickNpcCreateContext } from './quick-npc-create-context'
import {
  buildQuickNpcContentOptions,
  isQuickNpcMembershipTitleSetupComplete,
  isQuickNpcOrganizationMemberSetup,
  type QuickNpcOrganizationMemberSetupValues,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { buildQuickNpcSpeciesRadioCardPresentation } from './quick-npc-species-option-groups.lib'
import {
  buildNpcTemplateRadioOptions,
  QUICK_NPC_NPC_TEMPLATE_FIELD_PROMPT,
} from './quick-npc-npc-template-option.lib'
import { isQuickNpcStandaloneSetup } from './quick-npc-form-fields'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

export const QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE = 'Set up member' as const
export const QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION =
  'Choose a role and starting build from this organization’s recommendations.' as const
export const QUICK_NPC_STANDALONE_SETUP_HEADLINE = 'Set up NPC' as const
export const QUICK_NPC_STANDALONE_SETUP_DESCRIPTION =
  'Choose a role, species, and starting character options.' as const
export const QUICK_NPC_SETUP_CHANGE_LABEL = 'Change' as const

export type QuickNpcModalPhase = 'setup' | 'authoring'

export function resolveQuickNpcSetupDescription(context: QuickNpcCreateContext): string {
  return context.kind === 'standalone'
    ? QUICK_NPC_STANDALONE_SETUP_DESCRIPTION
    : QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION
}

export function resolveQuickNpcAuthoringDescription(context: QuickNpcCreateContext): string {
  if (context.kind === 'standalone') {
    return 'Create a new NPC.'
  }
  return `Create a new NPC as a member of ${context.organization.name}.`
}

function resolveQuickNpcModalHeadline(context: QuickNpcCreateContext): string {
  return context.kind === 'standalone'
    ? QUICK_NPC_STANDALONE_SETUP_HEADLINE
    : QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE
}

export function resolveQuickNpcModalChrome(
  context: QuickNpcCreateContext,
  phase: QuickNpcModalPhase,
): { headline: string; description: string } {
  const headline = resolveQuickNpcModalHeadline(context)
  const description =
    phase === 'setup'
      ? resolveQuickNpcSetupDescription(context)
      : resolveQuickNpcAuthoringDescription(context)
  return { headline, description }
}
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

export const QUICK_NPC_CREATE_SETUP_FOOTER_ACTIONS = [
  {
    id: 'preview',
    label: QUICK_NPC_PREVIEW_NPC_LABEL,
    visibility: 'final-set',
  },
] as const satisfies readonly CreateSetupFooterAction[]

export type QuickNpcCreateSetupFooterContext = {
  setupSets: readonly CreateSetupSet[]
  externalDecisions: readonly CreateSetupExternalDecision[]
  activeSetId: string | null
  isEditingUpstream: boolean
}

export function resolveQuickNpcCreateSetupFooterActions(
  args: QuickNpcCreateSetupFooterContext,
): CreateSetupFooterAction[] {
  return resolveCreateSetupFooterActions(QUICK_NPC_CREATE_SETUP_FOOTER_ACTIONS, {
    sequenceSetIds: resolveCreateSetupSequenceSetIds({
      sets: args.setupSets,
      externalDecisions: args.externalDecisions,
    }),
    activeSetId: args.activeSetId,
    isEditingUpstream: args.isEditingUpstream,
    externalDecisions: args.externalDecisions,
  })
}

export function quickNpcCreateSetupShowsPreviewNpc(
  actions: readonly CreateSetupFooterAction[],
): boolean {
  return actions.some((action) => action.id === 'preview')
}

export function quickNpcBuildRevision(values: QuickNpcSetupValues): string {
  if (values.contextKind === 'standalone') {
    return [
      values.npcTemplateId ?? '',
      values.speciesId,
      String(values.level),
      values.classId,
    ].join(':')
  }

  return [
    values.membershipTitle ?? '',
    values.npcTemplateId ?? '',
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
  if (!isCreateSetupChoiceComplete(args.values.npcTemplateId)) {
    return false
  }

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
  isQuickNpcBuildCardVisible,
  resolveQuickNpcBuildCardModel,
  QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
  QUICK_NPC_BUILD_DONE_LABEL,
  QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL,
} from './quick-npc-build-card.lib'
export { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'
export type { QuickNpcBuildCardModel } from './quick-npc-build-card.lib'

export type QuickNpcSetupSummaryState = {
  createContext: QuickNpcCreateContext
  values: QuickNpcSetupValues
  context: CharacterBuildContext
  titles: readonly OrganizationMembershipTitleDefinition[]
}

export const QUICK_NPC_SETUP_SUMMARY = [
  {
    id: 'membershipTitle',
    label: QUICK_NPC_AUTHORING_SETUP_ROLE_LABEL,
    targetSetId: 'membershipTitle',
    summaryGroup: QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP,
    summaryGroupEyebrow: QUICK_NPC_SETUP_SELECTIONS_EYEBROW,
    resolveValue: (state) => {
      if (state.createContext.kind !== 'organization-member') return null
      if (!isQuickNpcOrganizationMemberSetup(state.values)) return null
      if (!isQuickNpcMembershipTitleSetupComplete(state.values.membershipTitle)) return null
      return resolveQuickNpcMembershipTitleDisplayLabel(state.values.membershipTitle, state.titles)
    },
  },
  {
    id: 'npcTemplateId',
    label: QUICK_NPC_AUTHORING_SETUP_ROLE_LABEL,
    targetSetId: 'npcTemplateId',
    summaryGroup: QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP,
    summaryGroupEyebrow: QUICK_NPC_SETUP_SELECTIONS_EYEBROW,
    resolveValue: (state) => {
      if (!isQuickNpcStandaloneSetup(state.values) || !state.values.npcTemplateId) return null
      return getNpcTemplateLabel(state.values.npcTemplateId)
    },
  },
  {
    id: 'speciesId',
    label: QUICK_NPC_AUTHORING_SETUP_SPECIES_LABEL,
    targetSetId: 'speciesId',
    summaryGroup: QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP,
    summaryGroupEyebrow: QUICK_NPC_SETUP_SELECTIONS_EYEBROW,
    resolveValue: (state) => {
      if (!state.values.speciesId) return null
      return resolveQuickNpcSpeciesDisplayLabel(
        state.values.speciesId,
        indexCharacterBuildCatalog(state.context.catalog),
      )
    },
  },
  {
    id: QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
    label: QUICK_NPC_AUTHORING_SETUP_BUILD_LABEL,
    targetSetId: QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
    summaryGroup: QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP,
    summaryGroupEyebrow: QUICK_NPC_SETUP_SELECTIONS_EYEBROW,
    resolveValue: (state) => resolveQuickNpcBuildSummaryValue(state),
  },
] as const satisfies readonly CreateSetupSummaryDefinition<QuickNpcSetupSummaryState>[]

function resolveQuickNpcBuildSummaryValue(state: QuickNpcSetupSummaryState): string | null {
  const classSelected = Boolean(state.values.classId)
  if (
    !isQuickNpcBuildResolved({ values: state.values, context: state.context }) &&
    !classSelected
  ) {
    return null
  }

  return formatQuickNpcAuthoringBuildSummaryValue({
    values: state.values,
    titles: state.titles,
    catalogIndex: indexCharacterBuildCatalog(state.context.catalog),
  })
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
  if (isQuickNpcStandaloneSetup(args.values) && args.values.npcTemplateId) {
    parts.push(getNpcTemplateLabel(args.values.npcTemplateId))
  } else if (isQuickNpcOrganizationMemberSetup(args.values) && args.values.npcTemplateId) {
    parts.push(getNpcTemplateLabel(args.values.npcTemplateId))
  }

  const className = resolveQuickNpcClassDisplayLabel(args.values.classId, args.catalogIndex)
  if (isClassProgressionApplicable(args.values.level) && className) {
    parts.push(`Level ${args.values.level} ${className}`)
  } else {
    parts.push(`Level ${args.values.level}`)
  }

  return joinInlineMetadata(parts)
}

/** Role / Species / Build rows from current setup state, in registry order. */
export function resolveQuickNpcSetupSummaryRows(args: {
  createContext: QuickNpcCreateContext
  values: QuickNpcSetupValues
  context: CharacterBuildContext
  titles?: readonly OrganizationMembershipTitleDefinition[]
}): SetupSummaryRow[] {
  return resolveSetupSummaryRows(
    {
      createContext: args.createContext,
      values: args.values,
      context: args.context,
      titles: args.titles ?? [],
    },
    QUICK_NPC_SETUP_SUMMARY,
  )
}

type QuickNpcSetupSetBuilderArgs = {
  values: QuickNpcSetupValues
  titles: readonly OrganizationMembershipTitleDefinition[]
  speciesTermLabel: string
  speciesPresentation: ReturnType<typeof buildQuickNpcSpeciesRadioCardPresentation>
}

function buildQuickNpcSpeciesSetupSet(
  args: Pick<QuickNpcSetupSetBuilderArgs, 'values' | 'speciesTermLabel' | 'speciesPresentation'> & {
    visibleWhenComplete?: readonly string[]
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
    ...(args.visibleWhenComplete ? { visibleWhenComplete: args.visibleWhenComplete } : {}),
    summaryGroup: QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP,
    summaryGroupEyebrow: QUICK_NPC_SETUP_SELECTIONS_EYEBROW,
    isComplete: isCreateSetupChoiceComplete(args.values.speciesId),
  }
}

function buildQuickNpcNpcTemplateSetupSet(values: QuickNpcSetupValues): CreateSetupSet {
  const npcTemplateId = isQuickNpcStandaloneSetup(values) ? (values.npcTemplateId ?? '') : ''

  return {
    id: 'npcTemplateId',
    kind: 'choice',
    fieldLabel: QUICK_NPC_AUTHORING_SETUP_ROLE_LABEL,
    prompt: QUICK_NPC_NPC_TEMPLATE_FIELD_PROMPT,
    options: buildNpcTemplateRadioOptions(),
    value: npcTemplateId,
    summaryGroup: QUICK_NPC_SETUP_SELECTIONS_SUMMARY_GROUP,
    summaryGroupEyebrow: QUICK_NPC_SETUP_SELECTIONS_EYEBROW,
    isComplete: isCreateSetupChoiceComplete(npcTemplateId),
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
      buildQuickNpcNpcTemplateSetupSet(values),
      buildQuickNpcSpeciesSetupSet({
        ...setBuilderArgs,
        visibleWhenComplete: ['npcTemplateId'],
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
      visibleWhenComplete: ['membershipTitle'],
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
