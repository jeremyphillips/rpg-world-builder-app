import type { LocationPartyAssociation } from '@rpg/contracts'

type LocationPartyReferenceRecord = {
  partyAssociations?: readonly LocationPartyAssociation[]
}

/** Character ids referenced by location party associations. */
export function extractCharacterPartyIdsFromLocation(
  record: LocationPartyReferenceRecord,
): readonly string[] {
  const ids: string[] = []
  for (const association of record.partyAssociations ?? []) {
    if (association.party.kind === 'character') {
      ids.push(association.party.characterId)
    }
  }
  return ids
}

/** Organization ids referenced by location party associations. */
export function extractOrganizationPartyIdsFromLocation(
  record: LocationPartyReferenceRecord,
): readonly string[] {
  const ids: string[] = []
  for (const association of record.partyAssociations ?? []) {
    if (association.party.kind === 'organization') {
      ids.push(association.party.organizationId)
    }
  }
  return ids
}

/** All party reference ids (characters and organizations) for usage indexing. */
export function extractAllPartyIdsFromLocation(
  record: LocationPartyReferenceRecord,
): readonly string[] {
  return [
    ...extractCharacterPartyIdsFromLocation(record),
    ...extractOrganizationPartyIdsFromLocation(record),
  ]
}
