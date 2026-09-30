import {
  resolveOrganizationMembershipTitleProjection,
  type NpcTemplateId,
  type OrganizationMembershipTitleDefinition,
} from '@rpg/contracts'

import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'

import { resolveQuickNpcSelectedTitleRecommendation } from './quick-npc-class-recommendation.lib'
import { isQuickNpcMembershipTitleSetupComplete } from './quick-npc-form-fields'

/** Label for provenance copy when the current role matches a title or org suggestion. */
// fallow-ignore-next-line complexity
export function resolveQuickNpcNpcTemplateSuggestionSourceLabel(args: {
  membershipTitle: string | undefined
  titles: readonly OrganizationMembershipTitleDefinition[]
  organizationName?: string
  organizationTemplateId?: NpcTemplateId
  suggestedTemplateId?: NpcTemplateId
  selectedTemplateId?: NpcTemplateId
}): string | undefined {
  if (!args.selectedTemplateId || args.selectedTemplateId !== args.suggestedTemplateId) {
    return undefined
  }

  if (isQuickNpcMembershipTitleSetupComplete(args.membershipTitle)) {
    const titleRecommendation = resolveQuickNpcSelectedTitleRecommendation({
      membershipTitle: args.membershipTitle,
      titles: args.titles,
    })
    if (titleRecommendation?.templateId === args.selectedTemplateId) {
      const membershipTitleId = titleFromMembershipRadioValue(args.membershipTitle ?? '')
      if (membershipTitleId !== undefined) {
        const projection = resolveOrganizationMembershipTitleProjection({
          catalog: args.titles,
          membershipTitleId,
        })
        if (projection.status === 'resolved') {
          return projection.label
        }
      }
    }
  }

  if (
    args.organizationTemplateId === args.selectedTemplateId &&
    args.organizationName &&
    args.organizationName.trim().length > 0
  ) {
    return args.organizationName
  }

  return undefined
}
