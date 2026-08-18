import { resolvePlayableBuilderContent, type CharacterBuildContext } from '@rpg/contracts'

import type { OrganizationMemberSelectionPolicy } from './organization-member-picker-drawer.lib'

export function buildOrganizationMemberSelectionPolicy(input: {
  classAffinityIds: readonly string[]
  speciesAffinityIds: readonly string[]
  npcBuildContext: CharacterBuildContext | null | undefined
  buildContextFailed?: boolean
}): OrganizationMemberSelectionPolicy | undefined {
  const hasClassAffinities = input.classAffinityIds.length > 0
  const hasSpeciesAffinities = input.speciesAffinityIds.length > 0

  if (!hasClassAffinities && !hasSpeciesAffinities) return undefined
  if (input.buildContextFailed) return undefined
  if (input.npcBuildContext === null || input.npcBuildContext === undefined) return undefined

  const playable = resolvePlayableBuilderContent(input.npcBuildContext)

  return {
    classAffinityIds: input.classAffinityIds,
    speciesAffinityIds: input.speciesAffinityIds,
    playableClasses: hasClassAffinities ? playable.classes : [],
    playableSpecies: hasSpeciesAffinities ? playable.species : [],
  }
}
