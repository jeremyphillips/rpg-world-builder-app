import type {
  CharacterLocationConnectionKind,
  CharacterType,
  LocationConnectedPartyRow,
  OrganizationLocationConnection,
  PaginatedItems,
} from '@rpg/contracts'
import {
  CHARACTER_LOCATION_CONNECTION_KIND_IDS,
  comparePriorityDescending,
  getCharacterLocationConnectionDisplayLabel,
  getCharacterLocationConnectionFamily,
  getCharacterLocationConnectionPriority,
  getLocationConnectedPartySectionRank,
  getOrganizationLocationConnectionDisplayLabel,
  getOrganizationLocationConnectionFamily,
  getOrganizationLocationConnectionPriority,
  resolveLocationConnectedPartySectionGroup,
} from '@rpg/contracts'

import { CharacterModel } from '../../character'
import { CharacterRelationshipModel } from '../../character-relationships/character-relationship.model'
import { resolveCatalogForCampaign } from '../content.service'
import { locationWriteConfig } from '../locations/locations.config'
import { HomebrewOrganizationModel } from '../organizations/homebrew-organization.model'

type CharacterRelationshipHit = {
  _id: string
  characterId: string
  kind: string
  locationId?: string
}

type CharacterSubjectHit = {
  _id: unknown
  name: string
  characterType: CharacterType
}

type OrganizationConnectionHit = {
  _id: unknown
  name: string
  slug: string
  connections?: {
    locations?: OrganizationLocationConnection[]
  }
}

type ConnectedPartySortRow = LocationConnectedPartyRow & {
  sortSectionRank: number
  sortSubjectName: string
  sortSubjectId: string
}

function expandCharacterRelationshipRows(
  edge: CharacterRelationshipHit,
  character: CharacterSubjectHit,
  locationId: string,
): ConnectedPartySortRow | null {
  if (edge.locationId !== locationId) return null
  if (!(CHARACTER_LOCATION_CONNECTION_KIND_IDS as readonly string[]).includes(edge.kind)) {
    return null
  }

  const kind = edge.kind as CharacterLocationConnectionKind
  const subjectId = String(character._id)
  const family = getCharacterLocationConnectionFamily(kind)
  const sectionGroup = resolveLocationConnectedPartySectionGroup(family)

  return {
    relationshipId: edge._id,
    subjectType: 'character' as const,
    subject: {
      type: 'character' as const,
      id: subjectId,
      name: character.name,
      slug: subjectId,
      characterType: character.characterType,
    },
    kind,
    label: getCharacterLocationConnectionDisplayLabel(kind, 'inverse'),
    family,
    priority: getCharacterLocationConnectionPriority(kind),
    sectionGroup,
    sortSectionRank: getLocationConnectedPartySectionRank(sectionGroup),
    sortSubjectName: character.name,
    sortSubjectId: subjectId,
  }
}

function expandOrganizationRows(
  hit: OrganizationConnectionHit,
  locationId: string,
): ConnectedPartySortRow[] {
  const subjectId = String(hit._id)

  return (hit.connections?.locations ?? [])
    .filter((connection) => connection.locationId === locationId)
    .map((connection) => {
      const family = getOrganizationLocationConnectionFamily(connection.kind)
      const sectionGroup = resolveLocationConnectedPartySectionGroup(family)

      return {
        relationshipId: connection.id,
        subjectType: 'organization' as const,
        subject: {
          type: 'organization' as const,
          id: subjectId,
          name: hit.name,
          slug: hit.slug,
        },
        kind: connection.kind,
        label: getOrganizationLocationConnectionDisplayLabel(connection.kind, 'inverse'),
        family,
        priority: getOrganizationLocationConnectionPriority(connection.kind),
        sectionGroup,
        sortSectionRank: getLocationConnectedPartySectionRank(sectionGroup),
        sortSubjectName: hit.name,
        sortSubjectId: subjectId,
      }
    })
}

function sortConnectedPartyRows(rows: readonly ConnectedPartySortRow[]): ConnectedPartySortRow[] {
  return [...rows].sort((left, right) => {
    const sectionCompare = left.sortSectionRank - right.sortSectionRank
    if (sectionCompare !== 0) return sectionCompare

    const priorityCompare = comparePriorityDescending(left, right)
    if (priorityCompare !== 0) return priorityCompare

    const nameCompare = left.sortSubjectName.localeCompare(right.sortSubjectName, 'en', {
      sensitivity: 'base',
    })
    if (nameCompare !== 0) return nameCompare

    const subjectCompare = left.sortSubjectId.localeCompare(right.sortSubjectId)
    if (subjectCompare !== 0) return subjectCompare

    return left.relationshipId.localeCompare(right.relationshipId)
  })
}

function toPublicRow(row: ConnectedPartySortRow): LocationConnectedPartyRow {
  const base = {
    relationshipId: row.relationshipId,
    label: row.label,
    priority: row.priority,
    sectionGroup: row.sectionGroup,
  }

  if (row.subjectType === 'organization') {
    return {
      ...base,
      subjectType: 'organization',
      subject: row.subject,
      kind: row.kind,
      family: row.family,
    }
  }

  return {
    ...base,
    subjectType: 'character',
    subject: row.subject,
    kind: row.kind,
    family: row.family,
  }
}

/** Merged inverse projection of subject-owned location connections for one location. */
export async function resolveLocationConnectedParties(input: {
  campaignId: string
  locationId: string
  page: number
  pageSize: number
}): Promise<PaginatedItems<LocationConnectedPartyRow> | null> {
  const { campaignId, locationId, page, pageSize } = input

  const catalog = await resolveCatalogForCampaign(locationWriteConfig.readConfig, campaignId)
  const location = catalog.find((record) => record.id === locationId)
  if (!location) {
    return null
  }

  const [relationshipEdges, organizations] = await Promise.all([
    CharacterRelationshipModel.find({
      campaignId,
      locationId,
      kind: { $in: [...CHARACTER_LOCATION_CONNECTION_KIND_IDS] },
    })
      .select({ _id: 1, characterId: 1, kind: 1, locationId: 1 })
      .lean<CharacterRelationshipHit[]>(),
    HomebrewOrganizationModel.find({
      campaignId,
      'connections.locations.locationId': locationId,
    })
      .select({ _id: 1, name: 1, slug: 1, connections: 1 })
      .lean<OrganizationConnectionHit[]>(),
  ])

  const characterIds = [...new Set(relationshipEdges.map((edge) => edge.characterId))]
  const characters =
    characterIds.length > 0
      ? await CharacterModel.find({ _id: { $in: characterIds } })
          .select({ _id: 1, name: 1, characterType: 1 })
          .lean<CharacterSubjectHit[]>()
      : []
  const characterById = new Map(characters.map((character) => [String(character._id), character]))

  const characterRows = relationshipEdges.flatMap((edge) => {
    const character = characterById.get(edge.characterId)
    if (!character) return []
    const row = expandCharacterRelationshipRows(edge, character, locationId)
    return row ? [row] : []
  })

  const rows = sortConnectedPartyRows([
    ...characterRows,
    ...organizations.flatMap((hit) => expandOrganizationRows(hit, locationId)),
  ])

  const total = rows.length
  const skip = (page - 1) * pageSize
  const pageRows = rows.slice(skip, skip + pageSize).map(toPublicRow)

  return { items: pageRows, total }
}
