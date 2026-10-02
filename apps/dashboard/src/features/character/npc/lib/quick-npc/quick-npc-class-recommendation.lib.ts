import {
  isClassProgressionApplicable,
  resolveOrganizationMembershipTitleProjection,
  type CharacterBuildContext,
  type NpcTemplateId,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { membershipTitleIdFromRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'
import { resolveQuickNpcTemplateRecommendations } from './quick-npc-template-recommendations.lib'

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
  organizationTemplateId?: NpcTemplateId
}): string[] {
  const recommendations = resolveQuickNpcTemplateRecommendations({
    values: args.values,
    context: args.context,
    titles: args.titles,
    organizationClassAffinityIds: args.organizationClassAffinityIds,
    organizationTemplateId: args.organizationTemplateId,
  })

  return recommendations.classes.map((entry) => entry.id)
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
  organizationTemplateId?: NpcTemplateId
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
