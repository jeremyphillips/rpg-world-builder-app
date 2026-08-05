import {
  buildLocationPartyAssociation,
  getAssociationSemanticKey,
  getLocationPartyAssociationExactKey,
  getLocationPartyAssociationSemanticLabel,
  getOrganizationKindLabel,
  getPartyKindsForSemanticKey,
  LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES,
  type CampaignCharacterListItem,
  type CampaignNpcListItem,
  type CharacterBuildCatalogIndex,
  type LocationPartyAssociation,
  type LocationPartyAssociationSemanticId,
  type LocationPartyKind,
  type LocationPartyRef,
  type Organization,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { buildCharacterCardViewModel } from '@/features/character'
import { LOCATION_PARTY_ASSOCIATION_FAMILY_LABEL } from '../../lib/location-relationship-family-labels'

import type { LocationAuthoringType } from './location-authoring-type'
import { getAvailableLocationPartyAssociationKinds } from './location-party-authoring-policy'

export const LOCATION_PARTY_ASSOCIATIONS_FIELD = 'partyAssociations'

export const LOCATION_PARTY_SECTION_LABEL = LOCATION_PARTY_ASSOCIATION_FAMILY_LABEL

export const LOCATION_PARTY_SECTION_DESCRIPTION =
  'Add people and organizations involved with this place, such as owners, tenants, or operators.'

export const LOCATION_PARTY_EMPTY_TEXT = 'No people or organizations linked yet.'

export const LOCATION_PARTY_RELATIONSHIP_PLACEHOLDER = 'Choose relationship…'

export const LOCATION_PARTY_RELATED_TO_LABEL = 'Related to'

export const LOCATION_PARTY_SEARCH_DISABLED_PLACEHOLDER = 'Choose a relationship first'

export const LOCATION_PARTY_CHOOSE_RELATIONSHIP_LIST_MESSAGE =
  'Choose a relationship to see available people and organizations.'

export const LOCATION_PARTY_KIND_ORDER: readonly LocationPartyKind[] = ['character', 'organization']

export const LOCATION_PARTY_ADD_LABEL = 'Add relationship'

export const LOCATION_PARTY_UNRESOLVED_CHARACTER_LABEL = 'Unavailable character'

export const LOCATION_PARTY_UNRESOLVED_ORGANIZATION_LABEL = 'Unavailable organization'

export type LocationPartyCharacterOption = {
  id: string
  name: string
  summary: string
  characterType: 'pc' | 'npc'
}

/** Merges open campaign PCs and NPCs into a sorted lookup for party association rows. */
export function buildLocationPartyCharactersById(
  campaignCharacters: readonly Pick<CampaignCharacterListItem, 'character'>[],
  npcs: readonly Pick<CampaignNpcListItem, 'character'>[],
  catalogIndex: CharacterBuildCatalogIndex | null | undefined,
): Map<string, LocationPartyCharacterOption> {
  const entries: LocationPartyCharacterOption[] = [
    ...campaignCharacters.map(({ character }) => ({
      id: character.id,
      name: character.name,
      summary: character.summary,
      characterType: 'pc' as const,
    })),
    ...npcs.map(({ character }) => ({
      id: character.id,
      name: character.name,
      summary: catalogIndex ? buildCharacterCardViewModel(character, catalogIndex).summary : '',
      characterType: 'npc' as const,
    })),
  ].sort((left, right) => left.name.localeCompare(right.name))

  return new Map(entries.map((entry) => [entry.id, entry]))
}

export type LocationPartyAssociationRow = {
  association: LocationPartyAssociation
  semanticKey: LocationPartyAssociationSemanticId
  semanticLabel: string
  partyLabel: string
  partySummary?: string
  partyHref?: string
  partyUnresolved: boolean
}

export function buildLocationPartySemanticOptions(authoringType: LocationAuthoringType) {
  return getAvailableLocationPartyAssociationKinds(authoringType).map((value) => ({
    value,
    label: getLocationPartyAssociationSemanticLabel(value),
    description: LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES[value].description,
  }))
}

export function buildLocationPartyAssociationRows(input: {
  associations: readonly LocationPartyAssociation[]
  campaignId: string
  charactersById: ReadonlyMap<string, LocationPartyCharacterOption>
  organizationsById: ReadonlyMap<string, Organization>
}): LocationPartyAssociationRow[] {
  return input.associations.map((association) => {
    const semanticKey = getAssociationSemanticKey(association)
    const partyLabel = resolvePartyLabel(association.party, {
      charactersById: input.charactersById,
      organizationsById: input.organizationsById,
    })
    const partySummary = resolvePartySummary(association.party, {
      charactersById: input.charactersById,
      organizationsById: input.organizationsById,
    })
    const partyHref = resolvePartyHref(association.party, {
      campaignId: input.campaignId,
      charactersById: input.charactersById,
      organizationsById: input.organizationsById,
    })

    return {
      association,
      semanticKey,
      semanticLabel: getLocationPartyAssociationSemanticLabel(semanticKey),
      partyLabel: partyLabel.label,
      partySummary,
      partyHref,
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

function resolvePartyHref(
  party: LocationPartyRef,
  ctx: {
    campaignId: string
    charactersById: ReadonlyMap<string, LocationPartyCharacterOption>
    organizationsById: ReadonlyMap<string, Organization>
  },
): string | undefined {
  if (party.kind === 'character') {
    const character = ctx.charactersById.get(party.characterId)
    if (!character) return undefined
    return character.characterType === 'npc'
      ? ROUTES.campaign.npcs.detail(ctx.campaignId, character.id)
      : ROUTES.campaign.characters.detail(ctx.campaignId, character.id)
  }

  const organization = ctx.organizationsById.get(party.organizationId)
  if (!organization) return undefined
  return ROUTES.content.organizations.detail(ctx.campaignId, organization.id)
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

function resolvePartySummary(
  party: LocationPartyRef,
  ctx: {
    charactersById: ReadonlyMap<string, LocationPartyCharacterOption>
    organizationsById: ReadonlyMap<string, Organization>
  },
): string | undefined {
  if (party.kind === 'character') {
    const character = ctx.charactersById.get(party.characterId)
    return character?.summary || undefined
  }

  const organization = ctx.organizationsById.get(party.organizationId)
  if (!organization) return undefined
  return getOrganizationKindLabel(organization.organizationKind)
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

export function buildLocationPartyAddActionLabel(
  semanticKey: LocationPartyAssociationSemanticId,
): string {
  return `Add as ${getLocationPartyAssociationSemanticLabel(semanticKey).toLowerCase()}`
}

export function buildRelatedToSegmentOptions(
  semanticKey: LocationPartyAssociationSemanticId | null,
): Array<{ value: LocationPartyKind; label: string; disabled: boolean }> {
  const allowedKinds = semanticKey ? getPartyKindsForSemanticKey(semanticKey) : []

  return LOCATION_PARTY_KIND_ORDER.map((kind) => ({
    value: kind,
    label: segmentLabelForPartyKind(kind),
    disabled: !semanticKey || !allowedKinds.includes(kind),
  }))
}

export function resolvePartyKindForRelationshipChange(input: {
  previousPartyKind: LocationPartyKind | null
  partyKinds: readonly LocationPartyKind[]
}): LocationPartyKind | null {
  if (input.partyKinds.length === 0) return null
  if (input.previousPartyKind && input.partyKinds.includes(input.previousPartyKind)) {
    return input.previousPartyKind
  }
  return input.partyKinds[0] ?? null
}

export function buildLocationPartyAssociationExactKeyFromSelection(input: {
  semanticKey: LocationPartyAssociationSemanticId
  party: LocationPartyRef
}): string {
  return getLocationPartyAssociationExactKey(
    buildLocationPartyAssociation({
      id: 'preview',
      semanticKey: input.semanticKey,
      party: input.party,
    }),
  )
}

export function findLocationPartyAssociationId(input: {
  associations: readonly LocationPartyAssociation[]
  semanticKey: LocationPartyAssociationSemanticId
  party: LocationPartyRef
}): string | undefined {
  const targetKey = buildLocationPartyAssociationExactKeyFromSelection(input)
  return input.associations.find(
    (association) => getLocationPartyAssociationExactKey(association) === targetKey,
  )?.id
}

export function isLocationPartyAssociationSelected(input: {
  associations: readonly LocationPartyAssociation[]
  semanticKey: LocationPartyAssociationSemanticId
  party: LocationPartyRef
}): boolean {
  return findLocationPartyAssociationId(input) !== undefined
}
