import { resolvePlayableBuilderContent, type CharacterBuildContext } from '@rpg/contracts'

import type { OrganizationMemberSelectionPolicy } from './organization-member-picker-drawer.lib'

export function buildOrganizationMemberSelectionPolicy(input: {
  memberClassAffinityIds: readonly string[]
  memberSpeciesAffinityIds: readonly string[]
  npcBuildContext: CharacterBuildContext | null | undefined
  buildContextFailed?: boolean
}): OrganizationMemberSelectionPolicy | undefined {
  const hasClassAffinities = input.memberClassAffinityIds.length > 0
  const hasSpeciesAffinities = input.memberSpeciesAffinityIds.length > 0

  if (!hasClassAffinities && !hasSpeciesAffinities) return undefined
  if (input.buildContextFailed) return undefined
  if (input.npcBuildContext === null || input.npcBuildContext === undefined) return undefined

  const playable = resolvePlayableBuilderContent(input.npcBuildContext)

  return {
    memberClassAffinityIds: input.memberClassAffinityIds,
    memberSpeciesAffinityIds: input.memberSpeciesAffinityIds,
    playableClasses: hasClassAffinities ? playable.classes : [],
    playableSpecies: hasSpeciesAffinities ? playable.species : [],
  }
}
