import { isContentPlayableFor, type CharacterClass, type Species } from '@rpg/contracts'

import type { OrganizationMemberSelectionPolicy } from './organization-member-picker-drawer.lib'

export function resolveOrganizationMemberSelectionPolicyPending(input: {
  memberClassAffinityIds: readonly string[]
  memberSpeciesAffinityIds: readonly string[]
  classesPending: boolean
  speciesPending: boolean
}): boolean {
  return (
    (input.memberClassAffinityIds.length > 0 && input.classesPending) ||
    (input.memberSpeciesAffinityIds.length > 0 && input.speciesPending)
  )
}

export function buildOrganizationMemberSelectionPolicy(input: {
  memberClassAffinityIds: readonly string[]
  memberSpeciesAffinityIds: readonly string[]
  classes: readonly CharacterClass[] | undefined
  species: readonly Species[] | undefined
}): OrganizationMemberSelectionPolicy | undefined {
  const hasClassAffinities = input.memberClassAffinityIds.length > 0
  const hasSpeciesAffinities = input.memberSpeciesAffinityIds.length > 0

  if (!hasClassAffinities && !hasSpeciesAffinities) return undefined
  if (hasClassAffinities && input.classes === undefined) return undefined
  if (hasSpeciesAffinities && input.species === undefined) return undefined

  return {
    memberClassAffinityIds: input.memberClassAffinityIds,
    memberSpeciesAffinityIds: input.memberSpeciesAffinityIds,
    playableClasses: hasClassAffinities
      ? (input.classes?.filter((characterClass) =>
          isContentPlayableFor(characterClass, { kind: 'npc' }),
        ) ?? [])
      : [],
    playableSpecies: hasSpeciesAffinities
      ? (input.species?.filter((species) => isContentPlayableFor(species, { kind: 'npc' })) ?? [])
      : [],
  }
}
