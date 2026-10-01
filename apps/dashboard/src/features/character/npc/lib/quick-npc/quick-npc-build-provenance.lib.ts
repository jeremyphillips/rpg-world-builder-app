import {
  formatRecommendationSourceLabel,
  formatSourceSuggestsSentence,
  formatSuggestedBySentence,
  getNpcTemplateEntry,
  getNpcTemplateLabel,
  indexCharacterBuildCatalog,
  intersectPersistedContentIds,
  resolveOrganizationMembershipTitleProjection,
  SUGGESTED_BY_PREFIX,
  type CharacterBuildContext,
  type NpcTemplateId,
  type OrganizationMembershipTitleDefinition,
  type RecommendationSourceKind,
} from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'

import { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'
import { isQuickNpcMembershipTitleSetupComplete } from './quick-npc-form-fields'

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

const DISPLAY_SOURCE_PRECEDENCE = ['title', 'organization', 'role'] as const

type DisplaySourceKind = (typeof DISPLAY_SOURCE_PRECEDENCE)[number]

type ClassDisplaySource = {
  kind: DisplaySourceKind
  label: string
  classIds: readonly string[]
}

function resolveClassIdsFromSlugs(
  slugs: readonly string[],
  playableClassIds: ReadonlySet<string>,
  slugToId: ReadonlyMap<string, string>,
): string[] {
  const ids: string[] = []
  for (const slug of slugs) {
    const classId = slugToId.get(slug)
    if (classId && playableClassIds.has(classId)) {
      ids.push(classId)
    }
  }
  return ids
}

function resolveTitleClassDisplaySource(args: {
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
  playableClassIds: ReadonlySet<string>
  slugToId: ReadonlyMap<string, string>
}): ClassDisplaySource | undefined {
  if (!isQuickNpcMembershipTitleSetupComplete(args.membershipTitle)) {
    return undefined
  }

  const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
    membershipTitle: args.membershipTitle,
    titles: args.titles,
  })
  const overrideSlugs = titleRecommendation?.classPreferenceOverrideSlugs
  if (!overrideSlugs?.length) {
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

  return {
    kind: 'title',
    label: projection.label,
    classIds: resolveClassIdsFromSlugs(overrideSlugs, args.playableClassIds, args.slugToId),
  }
}

function resolveOrganizationClassDisplaySource(args: {
  organizationName?: string
  organizationClassAffinityIds?: readonly string[]
  playableClasses: readonly { id: string }[]
}): ClassDisplaySource | undefined {
  const orgName = args.organizationName?.trim()
  if (!orgName || !args.organizationClassAffinityIds?.length) {
    return undefined
  }

  return {
    kind: 'organization',
    label: orgName,
    classIds: intersectPersistedContentIds(args.organizationClassAffinityIds, args.playableClasses),
  }
}

function resolveRoleClassDisplaySource(args: {
  selectedTemplateId: NpcTemplateId | undefined
  playableClassIds: ReadonlySet<string>
  slugToId: ReadonlyMap<string, string>
}): ClassDisplaySource | undefined {
  if (!args.selectedTemplateId) {
    return undefined
  }

  const template = getNpcTemplateEntry(args.selectedTemplateId)
  const slugs = template?.recommendations.classPreferenceSlugs ?? []
  if (slugs.length === 0) {
    return undefined
  }

  return {
    kind: 'role',
    label: getNpcTemplateLabel(args.selectedTemplateId),
    classIds: resolveClassIdsFromSlugs(slugs, args.playableClassIds, args.slugToId),
  }
}

function resolveQuickNpcClassDisplaySources(args: {
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
  selectedTemplateId: NpcTemplateId | undefined
  organizationName?: string
  organizationClassAffinityIds?: readonly string[]
  context: CharacterBuildContext
}): ClassDisplaySource[] {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const playableClasses = [...catalogIndex.classes.values()]
  const playableClassIds = new Set(catalogIndex.classes.keys())
  const slugToId = new Map(
    playableClasses.map((characterClass) => [characterClass.slug, characterClass.id]),
  )

  const byKind = new Map<DisplaySourceKind, ClassDisplaySource>()
  const titleSource = resolveTitleClassDisplaySource({
    membershipTitle: args.membershipTitle,
    titles: args.titles,
    playableClassIds,
    slugToId,
  })
  if (titleSource) {
    byKind.set('title', titleSource)
  }

  const organizationSource = resolveOrganizationClassDisplaySource({
    organizationName: args.organizationName,
    organizationClassAffinityIds: args.organizationClassAffinityIds,
    playableClasses,
  })
  if (organizationSource) {
    byKind.set('organization', organizationSource)
  }

  const roleSource = resolveRoleClassDisplaySource({
    selectedTemplateId: args.selectedTemplateId,
    playableClassIds,
    slugToId,
  })
  if (roleSource) {
    byKind.set('role', roleSource)
  }

  return DISPLAY_SOURCE_PRECEDENCE.flatMap((kind) => {
    const source = byKind.get(kind)
    return source ? [source] : []
  })
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
}): string | undefined {
  if (!args.classId) {
    return undefined
  }

  const labelsById = new Map(args.classOptions.map((option) => [option.value, option.label]))
  const sources = resolveQuickNpcClassDisplaySources(args)

  for (const source of sources) {
    if (source.classIds.includes(args.classId)) {
      return formatSuggestionHelper({
        currentValue: args.classId,
        suggestedValue: args.classId,
        sourceLabel: source.label,
        sourceKind: source.kind,
      })
    }
  }

  for (const source of sources) {
    if (source.classIds.length === 0) {
      continue
    }
    const suggestedDisplay = formatClassLabels(source.classIds, labelsById)
    if (!suggestedDisplay) {
      continue
    }
    return formatSuggestionHelper({
      currentValue: args.classId,
      suggestedValue: source.classIds[0],
      suggestedDisplay,
      sourceLabel: source.label,
      sourceKind: source.kind,
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

  return formatSuggestionHelper({
    currentValue: args.level,
    suggestedValue: titleRecommendation.level,
    sourceLabel: projection.label,
    sourceKind: 'title',
    suggestedDisplay: `level ${titleRecommendation.level}`,
  })
}
