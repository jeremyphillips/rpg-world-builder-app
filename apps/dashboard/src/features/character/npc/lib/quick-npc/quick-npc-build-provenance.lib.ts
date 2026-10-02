import {
  formatRecommendationSourceLabel,
  formatSourceSuggestsSentence,
  formatSuggestedBySentence,
  getNpcTemplateLabel,
  resolveOrganizationMembershipTitleProjection,
  SUGGESTED_BY_PREFIX,
  type CharacterBuildContext,
  type NpcTemplateId,
  type OrganizationMembershipTitleDefinition,
  type OrganizationNpcClassRecommendationSource,
  type RecommendationSourceKind,
} from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'

import { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'
import {
  isQuickNpcMembershipTitleSetupComplete,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { resolveQuickNpcTemplateRecommendations } from './quick-npc-template-recommendations.lib'

export const QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER =
  'Classes are available from level 1.' as const

export const QUICK_NPC_SUGGESTED_BY_PREFIX = SUGGESTED_BY_PREFIX

export type FormatSuggestionHelperInput = {
  currentValue: string | number | undefined
  suggestedValue: string | number | undefined
  sourceLabel: string | undefined
  sourceKind?: RecommendationSourceKind
  suggestedDisplay?: string
}

function resolveSuggestionSourceLabel(input: FormatSuggestionHelperInput): string | undefined {
  const name = input.sourceLabel?.trim()
  if (!name) return undefined
  if (!input.sourceKind) return name
  return formatRecommendationSourceLabel(
    { kind: input.sourceKind },
    { name, density: 'attribute-helper' },
  )
}

export function formatSuggestionHelper(input: FormatSuggestionHelperInput): string | undefined {
  const sourceLabel = resolveSuggestionSourceLabel(input)
  if (!sourceLabel) {
    return undefined
  }

  const suggestedDisplay = input.suggestedDisplay?.trim()
  const hasSuggestedValue = input.suggestedValue !== undefined && input.suggestedValue !== ''
  if (!hasSuggestedValue && !suggestedDisplay) {
    return undefined
  }

  if (
    hasSuggestedValue &&
    input.currentValue !== undefined &&
    input.currentValue === input.suggestedValue
  ) {
    return formatSuggestedBySentence(sourceLabel, { trailingPeriod: true })
  }

  const display = suggestedDisplay ?? String(input.suggestedValue)
  if (!display) {
    return undefined
  }
  return formatSourceSuggestsSentence(sourceLabel, display)
}

const CLASS_RECOMMENDATION_SOURCE_ORDER: OrganizationNpcClassRecommendationSource[] = [
  'title',
  'organization',
  'template',
]

function recommendationSourceKind(
  source: OrganizationNpcClassRecommendationSource,
): RecommendationSourceKind | undefined {
  if (source === 'template') return 'role'
  if (source === 'title' || source === 'organization') return source
  return undefined
}

export function resolveQuickNpcSelectedTitleLabel(args: {
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
}): string | undefined {
  if (!isQuickNpcMembershipTitleSetupComplete(args.membershipTitle)) {
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
  return projection.status === 'resolved' ? projection.label : undefined
}

function classRecommendationSourceLabel(args: {
  source: OrganizationNpcClassRecommendationSource
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationName?: string
  selectedTemplateId: NpcTemplateId | undefined
}): string | undefined {
  if (args.source === 'title') {
    return resolveQuickNpcSelectedTitleLabel({
      membershipTitle: args.membershipTitle,
      titles: args.titles,
    })
  }
  if (args.source === 'organization') {
    return args.organizationName?.trim() || undefined
  }
  if (args.source === 'template' && args.selectedTemplateId) {
    return getNpcTemplateLabel(args.selectedTemplateId)
  }
  return undefined
}

function formatClassLabels(
  classIds: readonly string[],
  labelsById: ReadonlyMap<string, string>,
): string {
  return classIds
    .flatMap((classId) => {
      const label = labelsById.get(classId)
      return label ? [label] : []
    })
    .join(', ')
}

export function resolveQuickNpcClassRowHelper(args: {
  classId: string
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
  selectedTemplateId: NpcTemplateId | undefined
  organizationName?: string
  organizationClassAffinityIds?: readonly string[]
  context: CharacterBuildContext
  classOptions: readonly { value: string; label: string }[]
  setup: QuickNpcSetupValues
}): string | undefined {
  if (!args.classId) {
    return undefined
  }

  const labelsById = new Map(args.classOptions.map((option) => [option.value, option.label]))
  const recommendations = resolveQuickNpcTemplateRecommendations({
    values: args.setup,
    context: args.context,
    titles: args.titles,
    organizationClassAffinityIds: args.organizationClassAffinityIds,
    organizationTemplateId: args.selectedTemplateId,
  })

  const match = recommendations.classes.find((entry) => entry.id === args.classId)
  if (match) {
    const source = CLASS_RECOMMENDATION_SOURCE_ORDER.find((candidate) =>
      match.sources.includes(candidate),
    )
    if (source) {
      const sourceLabel = classRecommendationSourceLabel({
        source,
        membershipTitle: args.membershipTitle,
        titles: args.titles,
        organizationName: args.organizationName,
        selectedTemplateId: args.selectedTemplateId,
      })
      if (sourceLabel) {
        return formatSuggestionHelper({
          currentValue: args.classId,
          suggestedValue: args.classId,
          sourceLabel,
          sourceKind: recommendationSourceKind(source),
        })
      }
    }
  }

  for (const entry of recommendations.classes) {
    if (entry.id === args.classId) continue
    const source = CLASS_RECOMMENDATION_SOURCE_ORDER.find((candidate) =>
      entry.sources.includes(candidate),
    )
    if (!source) continue
    const sourceLabel = classRecommendationSourceLabel({
      source,
      membershipTitle: args.membershipTitle,
      titles: args.titles,
      organizationName: args.organizationName,
      selectedTemplateId: args.selectedTemplateId,
    })
    const suggestedDisplay = formatClassLabels([entry.id], labelsById)
    if (!sourceLabel || !suggestedDisplay) continue
    return formatSuggestionHelper({
      currentValue: args.classId,
      suggestedValue: entry.id,
      suggestedDisplay,
      sourceLabel,
      sourceKind: recommendationSourceKind(source),
    })
  }

  return undefined
}

type RoleDisplaySource = {
  kind: 'title' | 'organization'
  label: string
  templateId: NpcTemplateId
}

function resolveQuickNpcRoleDisplaySources(args: {
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationName?: string
  organizationTemplateId?: NpcTemplateId
}): RoleDisplaySource[] {
  const sources: RoleDisplaySource[] = []

  if (isQuickNpcMembershipTitleSetupComplete(args.membershipTitle)) {
    const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
      membershipTitle: args.membershipTitle,
      titles: args.titles,
    })
    if (titleRecommendation?.templateId) {
      const membershipTitleId = titleFromMembershipRadioValue(args.membershipTitle ?? '')
      if (membershipTitleId !== undefined) {
        const projection = resolveOrganizationMembershipTitleProjection({
          catalog: args.titles,
          membershipTitleId,
        })
        if (projection.status === 'resolved') {
          sources.push({
            kind: 'title',
            label: projection.label,
            templateId: titleRecommendation.templateId,
          })
        }
      }
    }
  }

  const orgName = args.organizationName?.trim()
  if (orgName && args.organizationTemplateId) {
    sources.push({
      kind: 'organization',
      label: orgName,
      templateId: args.organizationTemplateId,
    })
  }

  return sources
}

export function resolveQuickNpcRoleRowHelper(args: {
  selectedTemplateId: NpcTemplateId | undefined
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationName?: string
  organizationTemplateId?: NpcTemplateId
}): string | undefined {
  if (!args.selectedTemplateId) {
    return undefined
  }

  const sources = resolveQuickNpcRoleDisplaySources(args)

  for (const source of sources) {
    if (source.templateId === args.selectedTemplateId) {
      return formatSuggestionHelper({
        currentValue: args.selectedTemplateId,
        suggestedValue: args.selectedTemplateId,
        sourceLabel: source.label,
        sourceKind: source.kind,
      })
    }
  }

  for (const source of sources) {
    return formatSuggestionHelper({
      currentValue: args.selectedTemplateId,
      suggestedValue: source.templateId,
      suggestedDisplay: getNpcTemplateLabel(source.templateId),
      sourceLabel: source.label,
      sourceKind: source.kind,
    })
  }

  return undefined
}

export function resolveQuickNpcLevelRowHelper(args: {
  level: number
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
}): string | undefined {
  if (!isQuickNpcMembershipTitleSetupComplete(args.membershipTitle)) {
    return undefined
  }

  const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
    membershipTitle: args.membershipTitle,
    titles: args.titles,
  })
  if (titleRecommendation?.level === undefined) {
    return undefined
  }

  const titleLabel = resolveQuickNpcSelectedTitleLabel({
    membershipTitle: args.membershipTitle,
    titles: args.titles,
  })
  if (!titleLabel) {
    return undefined
  }

  return formatSuggestionHelper({
    currentValue: args.level,
    suggestedValue: titleRecommendation.level,
    sourceLabel: titleLabel,
    sourceKind: 'title',
    suggestedDisplay: `level ${titleRecommendation.level}`,
  })
}
