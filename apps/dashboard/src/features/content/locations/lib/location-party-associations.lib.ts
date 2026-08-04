import {
  buildLocationPartyAssociation,
  getAssociationSemanticKey,
  getLocationPartyAssociationExactKey,
  getLocationPartyAssociationSemanticLabel,
  getPartyKindsForSemanticKey,
  LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES,
  type LocationPartyAssociation,
  type LocationPartyAssociationSemanticId,
  type LocationPartyKind,
  type LocationPartyRef,
  type Organization,
} from '@rpg/contracts'

export const LOCATION_PARTY_ASSOCIATIONS_FIELD = 'partyAssociations'

export const LOCATION_PARTY_SECTION_LABEL = 'People & organizations'

export const LOCATION_PARTY_EMPTY_TEXT = 'No people or organizations linked yet.'

export const LOCATION_PARTY_ADD_LABEL = 'Add relationship'

export const LOCATION_PARTY_UNRESOLVED_CHARACTER_LABEL = 'Unavailable character'

export const LOCATION_PARTY_UNRESOLVED_ORGANIZATION_LABEL = 'Unavailable organization'

export type LocationPartyCharacterOption = {
  id: string
  name: string
  summary: string
  characterType: 'pc' | 'npc'
}

export type LocationPartyAssociationRow = {
  association: LocationPartyAssociation
  semanticKey: LocationPartyAssociationSemanticId
  semanticLabel: string
  partyLabel: string
  partyUnresolved: boolean
}

export function buildLocationPartySemanticOptions() {
  return (
    Object.keys(LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES) as LocationPartyAssociationSemanticId[]
  ).map((value) => ({
    value,
    label: getLocationPartyAssociationSemanticLabel(value),
    description: LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES[value].description,
  }))
}

export function buildLocationPartyAssociationRows(input: {
  associations: readonly LocationPartyAssociation[]
  charactersById: ReadonlyMap<string, LocationPartyCharacterOption>
  organizationsById: ReadonlyMap<string, Organization>
}): LocationPartyAssociationRow[] {
  return input.associations.map((association) => {
    const semanticKey = getAssociationSemanticKey(association)
    const partyLabel = resolvePartyLabel(association.party, {
      charactersById: input.charactersById,
      organizationsById: input.organizationsById,
    })

    return {
      association,
      semanticKey,
      semanticLabel: getLocationPartyAssociationSemanticLabel(semanticKey),
      partyLabel: partyLabel.label,
      partyUnresolved: partyLabel.unresolved,
    }
  })
}

export function groupLocationPartyAssociationRows(
  rows: readonly LocationPartyAssociationRow[],
): Map<LocationPartyAssociationSemanticId, LocationPartyAssociationRow[]> {
  const grouped = new Map<LocationPartyAssociationSemanticId, LocationPartyAssociationRow[]>()

  for (const row of rows) {
    const bucket = grouped.get(row.semanticKey) ?? []
    bucket.push(row)
    grouped.set(row.semanticKey, bucket)
  }

  return grouped
}

function resolvePartyLabel(
  party: LocationPartyRef,
  ctx: {
    charactersById: ReadonlyMap<string, LocationPartyCharacterOption>
    organizationsById: ReadonlyMap<string, Organization>
  },
): { label: string; unresolved: boolean } {
  if (party.kind === 'character') {
    const character = ctx.charactersById.get(party.characterId)
    if (!character) {
      return { label: LOCATION_PARTY_UNRESOLVED_CHARACTER_LABEL, unresolved: true }
    }
    return { label: character.name, unresolved: false }
  }

  const organization = ctx.organizationsById.get(party.organizationId)
  if (!organization) {
    return { label: LOCATION_PARTY_UNRESOLVED_ORGANIZATION_LABEL, unresolved: true }
  }
  return { label: organization.name, unresolved: false }
}

export function wouldDuplicateLocationPartyAssociation(
  associations: readonly LocationPartyAssociation[],
  candidate: LocationPartyAssociation,
): boolean {
  const candidateKey = getLocationPartyAssociationExactKey(candidate)
  return associations.some(
    (association) => getLocationPartyAssociationExactKey(association) === candidateKey,
  )
}

export function appendLocationPartyAssociation(input: {
  associations: readonly LocationPartyAssociation[]
  semanticKey: LocationPartyAssociationSemanticId
  party: LocationPartyRef
  id?: string
}): LocationPartyAssociation[] {
  const association = buildLocationPartyAssociation({
    id: input.id ?? crypto.randomUUID(),
    semanticKey: input.semanticKey,
    party: input.party,
  })

  if (wouldDuplicateLocationPartyAssociation(input.associations, association)) {
    return [...input.associations]
  }

  return [...input.associations, association]
}

export function removeLocationPartyAssociation(
  associations: readonly LocationPartyAssociation[],
  associationId: string,
): LocationPartyAssociation[] {
  return associations.filter((association) => association.id !== associationId)
}

export function segmentLabelForPartyKind(partyKind: LocationPartyKind): string {
  return partyKind === 'character' ? 'Characters' : 'Organizations'
}

export function buildPartyKindsForSemanticKey(
  semanticKey: LocationPartyAssociationSemanticId,
): readonly LocationPartyKind[] {
  return getPartyKindsForSemanticKey(semanticKey)
}

export function buildLocationPartySearchText(input: {
  name: string
  summary?: string
  organizationKindLabel?: string
}): string {
  return [input.name, input.summary, input.organizationKindLabel].filter(Boolean).join(' ')
}
