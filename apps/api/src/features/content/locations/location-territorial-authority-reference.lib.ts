import type { TerritorialAuthorityRelationship } from '@rpg/contracts'

type LocationTerritorialAuthorityReferenceRecord = {
  territorialAuthority?: readonly TerritorialAuthorityRelationship[]
}

/** Organization ids referenced by region territorial authority rows. */
export function extractOrganizationIdsFromTerritorialAuthority(
  record: LocationTerritorialAuthorityReferenceRecord,
): readonly string[] {
  const ids: string[] = []
  for (const relationship of record.territorialAuthority ?? []) {
    ids.push(relationship.organizationId)
  }
  return ids
}
