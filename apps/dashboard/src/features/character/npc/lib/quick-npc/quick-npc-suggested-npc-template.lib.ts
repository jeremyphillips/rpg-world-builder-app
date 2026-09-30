import type { NpcTemplateId, OrganizationMembershipTitleDefinition } from '@rpg/contracts'

import { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'

/** Title recommendation wins over the organization default role. */
export function resolveQuickNpcSuggestedNpcTemplateId(args: {
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationTemplateId?: NpcTemplateId
}): NpcTemplateId | undefined {
  const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
    membershipTitle: args.membershipTitle,
    titles: args.titles,
  })
  if (titleRecommendation?.templateId) {
    return titleRecommendation.templateId
  }
  return args.organizationTemplateId
}
