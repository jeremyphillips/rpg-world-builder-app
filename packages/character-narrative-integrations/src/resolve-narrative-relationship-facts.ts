import { resolveLocationConnectionEligibility, type Location } from '@rpg/contracts/rpg/content'
import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  type CharacterBuilderDraft,
  type CharacterRelationshipDraftEdge,
} from '@rpg/contracts/rpg/runtime'
import type {
  NarrativeBindingProvenance,
  NarrativeOrganizationFact,
  NarrativePersonFact,
  NarrativePersonRole,
  NarrativePlaceFact,
  NarrativePlaceRole,
  NarrativeRelationshipFacts,
  NarrativeResidenceFact,
} from '@rpg/contracts/character-narrative'

export type NarrativeCharacterReference = {
  id: string
  name: string
}

const PROPERTY_KINDS = new Set(['owns', 'tenant', 'operator', 'works_at'])

function draftProvenance(edgeId: string): NarrativeBindingProvenance {
  return { source: 'draft', draftEdgeId: edgeId }
}

function resolveConnectedCharacterId(
  edge: CharacterRelationshipDraftEdge,
  focalEndpoint: string,
): string | undefined {
  if (!('relatedCharacterId' in edge)) return undefined
  if (edge.characterId === focalEndpoint) return edge.relatedCharacterId
  if (edge.relatedCharacterId === focalEndpoint) return edge.characterId
  return undefined
}

function resolvePersonRole(
  edge: CharacterRelationshipDraftEdge,
  focalEndpoint: string,
): NarrativePersonRole | undefined {
  if (edge.kind === 'parentOf') {
    if (edge.relatedCharacterId === focalEndpoint) return 'parent'
    if (edge.characterId === focalEndpoint) return 'child'
    return undefined
  }

  if (edge.kind === 'mentorOf') {
    if (edge.relatedCharacterId === focalEndpoint) return 'mentor'
    return undefined
  }

  if (edge.kind === 'partnerOf') return 'partner'

  if (edge.kind === 'rivalOf') {
    if (edge.characterId === focalEndpoint) return 'rival'
    return undefined
  }

  return undefined
}

function resolvePersonFacts(
  draft: CharacterBuilderDraft,
  characters: readonly NarrativeCharacterReference[],
): NarrativePersonFact[] {
  const byId = new Map(characters.map((character) => [character.id, character]))
  const focalEndpoint = CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT

  return draft.relationshipEdges.flatMap((edge) => {
    const role = resolvePersonRole(edge, focalEndpoint)
    if (!role) return []

    const relatedId = resolveConnectedCharacterId(edge, focalEndpoint)
    if (!relatedId || relatedId === focalEndpoint) return []

    const character = byId.get(relatedId)
    if (!character) return []

    const lifecycle =
      'details' in edge && edge.details && 'lifecycle' in edge.details
        ? edge.details.lifecycle
        : undefined

    return [
      {
        id: character.id,
        name: character.name,
        role,
        ...(lifecycle !== undefined ? { lifecycle } : {}),
        affinities: [`person:${role}`],
        provenance: draftProvenance(edge.id),
      },
    ]
  })
}

function resolveResidenceFact(
  edge: CharacterRelationshipDraftEdge,
  location: Location,
): NarrativeResidenceFact {
  const lifecycle =
    'details' in edge && edge.details && 'lifecycle' in edge.details
      ? edge.details.lifecycle
      : undefined

  return {
    id: location.id,
    name: location.name,
    role: 'residence',
    ...(lifecycle !== undefined ? { lifecycle } : {}),
    affinities: [`location:${location.kind}`, 'place:residence'],
    provenance: draftProvenance(edge.id),
  }
}

function resolvePlaceFact(
  edge: CharacterRelationshipDraftEdge,
  location: Location,
  role: Exclude<NarrativePlaceRole, 'residence'>,
): NarrativePlaceFact {
  const lifecycle =
    'details' in edge && edge.details && 'lifecycle' in edge.details
      ? edge.details.lifecycle
      : undefined

  return {
    id: location.id,
    name: location.name,
    role,
    ...(lifecycle !== undefined ? { lifecycle } : {}),
    affinities: [`location:${location.kind}`, `place:${role}`],
    provenance: draftProvenance(edge.id),
  }
}

function resolvePlaceFacts(
  draft: CharacterBuilderDraft,
  locations: readonly Location[],
): {
  residences: NarrativeResidenceFact[]
  places: NarrativePlaceFact[]
} {
  const byId = new Map(locations.map((location) => [location.id, location]))
  const residences: NarrativeResidenceFact[] = []
  const places: NarrativePlaceFact[] = []

  for (const edge of draft.relationshipEdges) {
    if (!('locationId' in edge)) continue

    const location = byId.get(edge.locationId)
    if (!location || !('name' in location)) continue

    if (edge.kind === 'resides_at') {
      const classification =
        location.kind === 'structure'
          ? { kind: location.kind, structureType: location.structureType }
          : { kind: location.kind }
      if (
        !resolveLocationConnectionEligibility(classification).characterKinds.includes('resides_at')
      ) {
        continue
      }
      residences.push(resolveResidenceFact(edge, location))
      continue
    }

    if (edge.kind === 'hometown') {
      places.push(resolvePlaceFact(edge, location, 'hometown'))
      continue
    }

    if (edge.kind === 'birthplace') {
      places.push(resolvePlaceFact(edge, location, 'birthplace'))
      continue
    }

    if (PROPERTY_KINDS.has(edge.kind)) {
      places.push(resolvePlaceFact(edge, location, 'property'))
    }
  }

  return { residences, places }
}

function resolveOrganizationFacts(
  organizations: NarrativeOrganizationFact[],
): NarrativeOrganizationFact[] {
  return organizations
}

export function buildNarrativeRelationshipFacts(input: {
  draft: CharacterBuilderDraft
  organizations: NarrativeOrganizationFact[]
  locations: readonly Location[]
  characters: readonly NarrativeCharacterReference[]
}): NarrativeRelationshipFacts {
  const { residences, places } = resolvePlaceFacts(input.draft, input.locations)
  const people = resolvePersonFacts(input.draft, input.characters)

  return {
    organizations: resolveOrganizationFacts(input.organizations),
    residences,
    people,
    places,
  }
}

export function resolveOmittedRelationshipReferenceIds(input: {
  draft: CharacterBuilderDraft
  organizations: NarrativeOrganizationFact[]
  residences: NarrativeResidenceFact[]
  places: NarrativePlaceFact[]
  people: NarrativePersonFact[]
}): string[] {
  const resolvedIds = new Set([
    ...input.organizations.map(({ id }) => id),
    ...input.residences.map(({ id }) => id),
    ...input.places.map(({ id }) => id),
    ...input.people.map(({ id }) => id),
  ])

  const selectedIds = input.draft.relationshipEdges.flatMap((edge) => {
    if (edge.kind === 'organizationMembership') return [edge.organizationId]
    if ('locationId' in edge) return [edge.locationId]
    if ('relatedCharacterId' in edge) {
      return [edge.characterId, edge.relatedCharacterId].filter(
        (id) => id !== CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
      )
    }
    return []
  })

  return selectedIds.filter((id) => !resolvedIds.has(id))
}
