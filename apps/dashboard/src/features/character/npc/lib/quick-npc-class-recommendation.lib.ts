import {
  getNpcAuthoringTemplateClassAffinityIds,
  isClassProgressionApplicable,
  resolveOrganizationMembershipTitleDefinitionByLabel,
  resolveOrganizationNpcClassRecommendationIds,
  resolvePlayableBuilderContent,
  type CharacterBuildContext,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../components/connections/organization-membership-title-field.lib'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'
import { isQuickNpcOrganizationMemberSetup } from './quick-npc-form-fields'

export function resolveQuickNpcSelectedTitleRecommendation(args: {
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
}) {
  if (args.membershipTitle === undefined) {
    return undefined
  }
  const persistedTitle = titleFromMembershipRadioValue(args.membershipTitle)
  if (persistedTitle === undefined) {
    return undefined
  }
  return resolveOrganizationMembershipTitleDefinitionByLabel(args.titles, persistedTitle)
    ?.npcRecommendation
}

export function resolveQuickNpcClassRecommendationIds(args: {
  values: QuickNpcSetupValues
  context: CharacterBuildContext
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationClassAffinityIds?: readonly string[]
}): string[] {
  const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
    membershipTitle: isQuickNpcOrganizationMemberSetup(args.values)
      ? args.values.membershipTitle
      : undefined,
    titles: args.titles,
  })
  const playableClasses = resolvePlayableBuilderContent(args.context).classes

  return resolveOrganizationNpcClassRecommendationIds({
    templateClassAffinitySlugs:
      titleRecommendation === undefined
        ? undefined
        : getNpcAuthoringTemplateClassAffinityIds(titleRecommendation.templateId),
    organizationClassAffinityIds: args.organizationClassAffinityIds,
    playableClasses,
  })
}

/** Seeds exactly one eligible recommendation; otherwise leaves Class unresolved. */
export function resolveQuickNpcClassIdFromRecommendationCardinality(
  recommendedClassIds: readonly string[],
): string {
  return recommendedClassIds.length === 1 ? recommendedClassIds[0]! : ''
}

export function applyQuickNpcRecommendedClassSeeding(args: {
  values: QuickNpcSetupValues
  context: CharacterBuildContext
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationClassAffinityIds?: readonly string[]
}): QuickNpcSetupValues {
  if (!isClassProgressionApplicable(args.values.level)) {
    return { ...args.values, classId: '' }
  }

  const recommendedClassIds = resolveQuickNpcClassRecommendationIds(args)
  return {
    ...args.values,
    classId: resolveQuickNpcClassIdFromRecommendationCardinality(recommendedClassIds),
  }
}
