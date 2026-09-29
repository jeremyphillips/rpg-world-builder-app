import {
  getNpcAuthoringTemplateClassAffinityIds,
  isClassProgressionApplicable,
  resolveOrganizationMembershipTitleProjection,
  resolveOrganizationNpcClassRecommendationIds,
  resolvePlayableBuilderContent,
  type CharacterBuildContext,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { membershipTitleIdFromRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'
import { isQuickNpcOrganizationMemberSetup } from './quick-npc-form-fields'

export function resolveQuickNpcSelectedTitleRecommendation(args: {
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
}) {
  if (args.membershipTitle === undefined) {
    return undefined
  }
  let membershipTitleId: string
  try {
    membershipTitleId = membershipTitleIdFromRadioValue(args.membershipTitle)
  } catch {
    return undefined
  }
  const projection = resolveOrganizationMembershipTitleProjection({
    catalog: args.titles,
    membershipTitleId,
  })
  return projection.status === 'resolved' ? projection.npcRecommendation : undefined
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
