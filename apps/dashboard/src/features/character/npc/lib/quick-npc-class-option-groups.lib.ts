import {
  getContentTypeSentenceForm,
  resolveOrganizationMemberClassRecommendationIds,
  type CharacterClass,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  buildQuickNpcAffinityRadioCardPresentation,
  QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW,
} from './quick-npc-affinity-option-groups.lib'

export const QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW = QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW
export const QUICK_NPC_CLASS_ALL_GROUP_EYEBROW = `All other ${getContentTypeSentenceForm('classes', 2)}`

export function buildQuickNpcClassRadioCardPresentation(input: {
  classOptions: readonly FieldOption[]
  classAffinityIds?: readonly string[]
  playableClasses: readonly CharacterClass[]
}) {
  const recommendedIds = resolveOrganizationMemberClassRecommendationIds({
    classAffinityIds: input.classAffinityIds ?? [],
    playableClasses: input.playableClasses,
  })

  return buildQuickNpcAffinityRadioCardPresentation({
    options: input.classOptions,
    recommendedIds,
    recommendedGroupEyebrow: QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
    allOtherGroupEyebrow: QUICK_NPC_CLASS_ALL_GROUP_EYEBROW,
    allOtherGroupId: 'all-classes',
  })
}
