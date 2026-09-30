import type { CharacterClass } from '../../../content/classes/class'
import type { AutomaticNpcBuildPreferences } from '../automatic/automatic-npc-build-seed'
import { isClassProgressionApplicable } from '../progression/character-level-policy'
import { type NpcRecommendationSource, type SourcedRecommendation } from '../sourced-recommendation'
import { ABILITY_IDS, type Ability } from '../../../vocab/ability'
import {
  getNpcTemplateEntry,
  NPC_TEMPLATE_FALLBACK_ID,
  type NpcTemplateId,
} from '../../../vocab/npc/npc-template'
import {
  resolveOrganizationNpcClassRecommendationIds,
  type OrganizationNpcClassRecommendationSource,
  type SourcedClassRecommendation,
} from '../../character/organization-membership/organization-member-class-recommendations'

export {
  NPC_RECOMMENDATION_SOURCES,
  type NpcRecommendationSource,
  type SourcedRecommendation,
} from '../sourced-recommendation'

export type NpcTemplateRecommendationTitle = {
  templateId?: NpcTemplateId
  classPreferenceOverrideSlugs?: readonly string[]
  skillPreferenceSlugs?: readonly string[]
  toolPreferenceSlugs?: readonly string[]
}

export type ResolveNpcTemplateRecommendationsInput = {
  level: number
  /** Explicit setup choice. Wins template selection. */
  userTemplateId?: NpcTemplateId
  /** Explicit class ids. When class progression applies, they replace class recommendations. */
  userClassIds?: readonly string[]
  userSkillSlugs?: readonly string[]
  userToolSlugs?: readonly string[]
  userLanguageIds?: readonly string[]
  /** Full six-ability permutation. Wins ability order when complete. */
  userAbilityPriority?: readonly Ability[]
  title?: NpcTemplateRecommendationTitle
  organizationTemplateId?: NpcTemplateId
  organizationClassAffinityIds?: readonly string[]
  speciesLanguageAffinityIds?: readonly string[]
  playableClasses: readonly CharacterClass[]
}

export type NpcTemplateRecommendationSet = {
  /**
   * Selected template. Undefined when the resolver used the Commoner fallback.
   * The fallback is never a draft value.
   */
  npcTemplateId: NpcTemplateId | undefined
  usedCommonerFallback: boolean
  classApplicable: boolean
  classes: SourcedClassRecommendation[]
  skills: SourcedRecommendation[]
  tools: SourcedRecommendation[]
  languages: SourcedRecommendation[]
  abilityPriority: readonly Ability[]
}

function isCompleteAbilityPriority(
  order: readonly Ability[] | undefined,
): order is readonly Ability[] {
  if (!order || order.length !== ABILITY_IDS.length) return false
  return (
    new Set(order).size === ABILITY_IDS.length &&
    order.every((ability) => ABILITY_IDS.includes(ability))
  )
}

function mergeOrderedRecommendations(
  groups: readonly { ids: readonly string[]; source: NpcRecommendationSource }[],
): SourcedRecommendation[] {
  const sourcesById = new Map<string, NpcRecommendationSource[]>()
  const order: string[] = []

  for (const group of groups) {
    for (const id of group.ids) {
      const existing = sourcesById.get(id)
      if (!existing) {
        sourcesById.set(id, [group.source])
        order.push(id)
        continue
      }
      if (!existing.includes(group.source)) existing.push(group.source)
    }
  }

  return order.map((id) => ({ id, sources: sourcesById.get(id) ?? [] }))
}

function resolveSelectedTemplate(input: ResolveNpcTemplateRecommendationsInput): {
  npcTemplateId: NpcTemplateId | undefined
  recommendationTemplateId: NpcTemplateId
  usedCommonerFallback: boolean
} {
  const selected = input.userTemplateId ?? input.title?.templateId ?? input.organizationTemplateId
  if (selected && getNpcTemplateEntry(selected)) {
    return {
      npcTemplateId: selected,
      recommendationTemplateId: selected,
      usedCommonerFallback: false,
    }
  }

  return {
    npcTemplateId: undefined,
    recommendationTemplateId: NPC_TEMPLATE_FALLBACK_ID,
    usedCommonerFallback: true,
  }
}

function resolveClassRecommendations(
  input: ResolveNpcTemplateRecommendationsInput,
  templateId: NpcTemplateId,
): SourcedClassRecommendation[] {
  if (!isClassProgressionApplicable(input.level)) return []

  if (input.userClassIds && input.userClassIds.length > 0) {
    const playableIds = new Set(input.playableClasses.map((characterClass) => characterClass.id))
    const seen = new Set<string>()
    const classes: SourcedClassRecommendation[] = []
    for (const classId of input.userClassIds) {
      if (!playableIds.has(classId) || seen.has(classId)) continue
      seen.add(classId)
      classes.push({ id: classId, sources: ['user'] })
    }
    return classes
  }

  const template = getNpcTemplateEntry(templateId)
  const override = input.title?.classPreferenceOverrideSlugs
  const templateSource: OrganizationNpcClassRecommendationSource = override ? 'title' : 'template'
  const templateSlugs = override ?? template?.recommendations.classPreferenceSlugs ?? []

  return resolveOrganizationNpcClassRecommendationIds({
    templateClassAffinitySlugs: templateSlugs,
    templateSource,
    organizationClassAffinityIds: input.organizationClassAffinityIds,
    playableClasses: input.playableClasses,
  })
}

function resolveAbilityPriority(
  input: ResolveNpcTemplateRecommendationsInput,
  templatePriority: readonly Ability[] | undefined,
): readonly Ability[] {
  if (isCompleteAbilityPriority(input.userAbilityPriority)) return input.userAbilityPriority
  return templatePriority ?? ABILITY_IDS
}

function resolveSkillRecommendations(
  input: ResolveNpcTemplateRecommendationsInput,
  templateSlugs: readonly string[],
): SourcedRecommendation[] {
  return mergeOrderedRecommendations([
    { ids: input.userSkillSlugs ?? [], source: 'user' },
    { ids: input.title?.skillPreferenceSlugs ?? [], source: 'title' },
    { ids: templateSlugs, source: 'template' },
  ])
}

function resolveToolRecommendations(
  input: ResolveNpcTemplateRecommendationsInput,
  templateSlugs: readonly string[],
): SourcedRecommendation[] {
  return mergeOrderedRecommendations([
    { ids: input.userToolSlugs ?? [], source: 'user' },
    { ids: input.title?.toolPreferenceSlugs ?? [], source: 'title' },
    { ids: templateSlugs, source: 'template' },
  ])
}

function resolveLanguageRecommendations(
  input: ResolveNpcTemplateRecommendationsInput,
  templateIds: readonly string[],
): SourcedRecommendation[] {
  return mergeOrderedRecommendations([
    { ids: input.userLanguageIds ?? [], source: 'user' },
    { ids: input.speciesLanguageAffinityIds ?? [], source: 'species' },
    { ids: templateIds, source: 'template' },
  ])
}

/**
 * One source-aware recommendation set for Quick NPC and automatic build.
 * Recommendations order existing choices. They never add slots, grants, or equipment.
 */
export function resolveNpcTemplateRecommendations(
  input: ResolveNpcTemplateRecommendationsInput,
): NpcTemplateRecommendationSet {
  const selected = resolveSelectedTemplate(input)
  const recommendations = getNpcTemplateEntry(selected.recommendationTemplateId)?.recommendations

  return {
    npcTemplateId: selected.npcTemplateId,
    usedCommonerFallback: selected.usedCommonerFallback,
    classApplicable: isClassProgressionApplicable(input.level),
    classes: resolveClassRecommendations(input, selected.recommendationTemplateId),
    skills: resolveSkillRecommendations(input, recommendations?.skillSlugs ?? []),
    tools: resolveToolRecommendations(input, recommendations?.toolSlugs ?? []),
    languages: resolveLanguageRecommendations(input, recommendations?.languageIds ?? []),
    abilityPriority: resolveAbilityPriority(input, recommendations?.abilityPriority),
  }
}

/** Copies a recommendation set into the soft-preference input of automatic build. */
export function toAutomaticNpcBuildPreferences(
  recommendations: NpcTemplateRecommendationSet,
): AutomaticNpcBuildPreferences {
  return {
    abilityPriority: recommendations.abilityPriority,
    skills: recommendations.skills,
    tools: recommendations.tools,
    languages: recommendations.languages,
  }
}
