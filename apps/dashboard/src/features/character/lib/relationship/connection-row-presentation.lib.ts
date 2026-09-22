import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  getCharacterRelationshipEdgeKindDisplayLabel,
  getCharacterRelationshipEdgeKindEntry,
  isViewerRelationshipSource,
  type CharacterRelationshipDraftEdge,
  type Location,
  type Organization,
} from '@rpg/contracts'
import type { ReactNode } from 'react'

import { ROUTES } from '@/app/routes'
import type { CharacterPickerOption } from '../picker/character-picker-option.lib'
import {
  UNAVAILABLE_LOCATION_LABEL,
  UNAVAILABLE_ORGANIZATION_LABEL,
} from '../display/character-display'

export type ConnectionRowPresentation = {
  heading: string
  description?: string
  headingHref?: string
  canViewRecord: boolean
}

function resolveOrganizationName(
  organizationId: string,
  organizationsById: Map<string, Organization>,
): string {
  return organizationsById.get(organizationId)?.name ?? organizationId
}

function resolveLocationName(locationId: string, locationsById: Map<string, Location>): string {
  return locationsById.get(locationId)?.name ?? UNAVAILABLE_LOCATION_LABEL
}

function resolveCharacterName(
  characterId: string,
  charactersById: Map<string, CharacterPickerOption>,
): string {
  return charactersById.get(characterId)?.name ?? characterId
}

export function resolveCharacterConnectionHref(
  campaignId: string,
  characterId: string,
  charactersById: Map<string, CharacterPickerOption>,
): string | undefined {
  const character = charactersById.get(characterId)
  if (!character) return undefined

  return character.characterType === 'npc'
    ? ROUTES.campaign.npcs.detail(campaignId, characterId)
    : ROUTES.campaign.characters.detail(campaignId, characterId)
}

function resolvePersonRoleLabel(
  edge: Extract<CharacterRelationshipDraftEdge, { relatedCharacterId: string }>,
): string {
  const viewerIsSource =
    edge.characterId === CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT
      ? true
      : edge.relatedCharacterId === CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT
        ? false
        : isViewerRelationshipSource(CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT, {
            characterId: edge.characterId,
            relatedCharacterId: edge.relatedCharacterId,
          })

  const direction = viewerIsSource ? 'forward' : 'inverse'
  return getCharacterRelationshipEdgeKindDisplayLabel(edge.kind, direction)
}

function membershipTitle(
  edge: Extract<CharacterRelationshipDraftEdge, { kind: 'organizationMembership' }>,
): string | undefined {
  return edge.details?.title
}

function resolveOrganizationRowPresentation(input: {
  edge: Extract<CharacterRelationshipDraftEdge, { kind: 'organizationMembership' }>
  campaignId?: string
  organizationsById: Map<string, Organization>
}): ConnectionRowPresentation {
  const heading = resolveOrganizationName(input.edge.organizationId, input.organizationsById)
  const unavailable = !input.organizationsById.has(input.edge.organizationId)
  const headingHref =
    input.campaignId && !unavailable
      ? ROUTES.content.organizations.detail(input.campaignId, input.edge.organizationId)
      : undefined

  return {
    heading: unavailable ? input.edge.organizationId : heading,
    description: membershipTitle(input.edge),
    headingHref,
    canViewRecord: Boolean(headingHref),
  }
}

function resolveLocationRowPresentation(input: {
  edge: Extract<CharacterRelationshipDraftEdge, { locationId: string }>
  campaignId?: string
  locationsById: Map<string, Location>
}): ConnectionRowPresentation {
  const heading = resolveLocationName(input.edge.locationId, input.locationsById)
  const unavailable = !input.locationsById.has(input.edge.locationId)
  const kindEntry = getCharacterRelationshipEdgeKindEntry(input.edge.kind)
  const headingHref =
    input.campaignId && !unavailable
      ? ROUTES.content.locations.detail(input.campaignId, input.edge.locationId)
      : undefined

  return {
    heading,
    description: kindEntry?.label,
    headingHref,
    canViewRecord: Boolean(headingHref),
  }
}

function resolveConnectedCharacterId(
  edge: Extract<CharacterRelationshipDraftEdge, { relatedCharacterId: string }>,
): string {
  if (edge.characterId === CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT) {
    return edge.relatedCharacterId
  }
  if (edge.relatedCharacterId === CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT) {
    return edge.characterId
  }
  return edge.relatedCharacterId
}

function resolvePersonRowPresentation(input: {
  edge: Extract<CharacterRelationshipDraftEdge, { relatedCharacterId: string }>
  campaignId?: string
  charactersById: Map<string, CharacterPickerOption>
}): ConnectionRowPresentation {
  const connectedCharacterId = resolveConnectedCharacterId(input.edge)
  const heading = resolveCharacterName(connectedCharacterId, input.charactersById)
  const unavailable = !input.charactersById.has(connectedCharacterId)
  const headingHref =
    input.campaignId && !unavailable
      ? resolveCharacterConnectionHref(input.campaignId, connectedCharacterId, input.charactersById)
      : undefined

  return {
    heading: unavailable ? connectedCharacterId : heading,
    description: resolvePersonRoleLabel(input.edge),
    headingHref,
    canViewRecord: Boolean(headingHref),
  }
}

export function resolveConnectionRowPresentation(input: {
  edge: CharacterRelationshipDraftEdge
  campaignId?: string
  organizationsById: Map<string, Organization>
  locationsById: Map<string, Location>
  charactersById: Map<string, CharacterPickerOption>
}): ConnectionRowPresentation {
  const { edge, campaignId, organizationsById, locationsById, charactersById } = input

  if (edge.kind === 'organizationMembership') {
    return resolveOrganizationRowPresentation({ edge, campaignId, organizationsById })
  }

  if ('locationId' in edge) {
    return resolveLocationRowPresentation({ edge, campaignId, locationsById })
  }

  if ('relatedCharacterId' in edge) {
    return resolvePersonRowPresentation({ edge, campaignId, charactersById })
  }

  return {
    heading: 'Connection',
    canViewRecord: false,
  }
}

export function formatConnectionRowMetadataSummary(
  presentation: ConnectionRowPresentation,
): ReactNode {
  return presentation.description
}

export function resolveUnavailableEntityLabel(
  edge: CharacterRelationshipDraftEdge,
  organizationsById: Map<string, Organization>,
  locationsById: Map<string, Location>,
  charactersById: Map<string, CharacterPickerOption>,
): string | undefined {
  if (edge.kind === 'organizationMembership' && !organizationsById.has(edge.organizationId)) {
    return UNAVAILABLE_ORGANIZATION_LABEL
  }
  if ('locationId' in edge && !locationsById.has(edge.locationId)) {
    return 'Missing location'
  }
  if ('relatedCharacterId' in edge) {
    const connectedCharacterId =
      edge.characterId === CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT
        ? edge.relatedCharacterId
        : edge.characterId
    if (!charactersById.has(connectedCharacterId)) {
      return 'Missing character'
    }
  }
  return undefined
}
