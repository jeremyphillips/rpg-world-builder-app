import {
  indexCharacterBuildCatalog,
  isClassProgressionApplicable,
  resolveNpcTemplateRecommendations,
  resolvePlayableBuilderContent,
  toAutomaticNpcBuildPreferences,
  type AutomaticNpcBuildPreferences,
  type CharacterBuildContext,
  type NpcTemplateId,
  type NpcTemplateRecommendationSet,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import {
  isQuickNpcOrganizationMemberSetup,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'

export function resolveQuickNpcTemplateRecommendations(args: {
  values: QuickNpcSetupValues
  context: CharacterBuildContext
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationClassAffinityIds?: readonly string[]
  organizationTemplateId?: NpcTemplateId
  /** When true, explicit class replaces template class recommendations (automatic build). */
  lockInUserClass?: boolean
}): NpcTemplateRecommendationSet {
  const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
    membershipTitle: isQuickNpcOrganizationMemberSetup(args.values)
      ? args.values.membershipTitle
      : undefined,
    titles: args.titles,
  })

  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const species = catalogIndex.species.get(args.values.speciesId)

  return resolveNpcTemplateRecommendations({
    level: args.values.level,
    userTemplateId: args.values.npcTemplateId,
    ...(args.lockInUserClass &&
    args.values.classId &&
    isClassProgressionApplicable(args.values.level)
      ? { userClassIds: [args.values.classId] }
      : {}),
    title: titleRecommendation
      ? {
          templateId: titleRecommendation.templateId,
          classPreferenceOverrideSlugs: titleRecommendation.classPreferenceOverrideSlugs,
          skillPreferenceSlugs: titleRecommendation.skillPreferenceSlugs,
          toolPreferenceSlugs: titleRecommendation.toolPreferenceSlugs,
        }
      : undefined,
    organizationTemplateId: args.organizationTemplateId,
    organizationClassAffinityIds: args.organizationClassAffinityIds,
    speciesLanguageAffinityIds: species?.languageAffinities,
    playableClasses: resolvePlayableBuilderContent(args.context).classes,
  })
}

export function buildQuickNpcAutomaticPreferences(args: {
  values: QuickNpcSetupValues
  context: CharacterBuildContext
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationClassAffinityIds?: readonly string[]
  organizationTemplateId?: NpcTemplateId
}): AutomaticNpcBuildPreferences {
  return toAutomaticNpcBuildPreferences(
    resolveQuickNpcTemplateRecommendations({ ...args, lockInUserClass: true }),
  )
}
