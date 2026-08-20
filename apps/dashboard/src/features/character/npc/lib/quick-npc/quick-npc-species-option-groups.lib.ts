import {
  getContentTypeSentenceForm,
  resolveOrganizationMemberSpeciesRecommendationIds,
  type Species,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  buildQuickNpcAffinityRadioCardPresentation,
  QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW,
} from './quick-npc-affinity-option-groups.lib'

export const QUICK_NPC_SPECIES_ALL_GROUP_EYEBROW = `All other ${getContentTypeSentenceForm('species', 2)}`

export function buildQuickNpcSpeciesRadioCardPresentation(input: {
  speciesOptions: readonly FieldOption[]
  speciesAffinityIds?: readonly string[]
  playableSpecies: readonly Species[]
}) {
  const recommendedIds = resolveOrganizationMemberSpeciesRecommendationIds({
    speciesAffinityIds: input.speciesAffinityIds ?? [],
    playableSpecies: input.playableSpecies,
  })

  return buildQuickNpcAffinityRadioCardPresentation({
    options: input.speciesOptions,
    recommendedIds,
    recommendedGroupEyebrow: QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW,
    allOtherGroupEyebrow: QUICK_NPC_SPECIES_ALL_GROUP_EYEBROW,
    allOtherGroupId: 'all-species',
  })
}
