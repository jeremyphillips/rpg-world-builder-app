import type {
  CharacterLocationConnectionKind,
  CharacterType,
  LocationConnectedPartyRow,
  OrganizationLocationConnection,
  PaginatedItems,
} from '@rpg/contracts'
import {
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
import { resolveCatalogForCampaign } from '../content.service'
import { locationWriteConfig } from '../locations/locations.config'
import { HomebrewOrganizationModel } from '../organizations/homebrew-organization.model'

type CharacterConnectionHit = {
  _id: unknown
  name: string
  characterType: CharacterType
  connections?: {
    locations?: Array<{ id: string; locationId: string; kind: string }>
  }
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

function expandCharacterRows(
  hit: CharacterConnectionHit,
  locationId: string,
): ConnectedPartySortRow[] {
  const subjectId = String(hit._id)

  return (hit.connections?.locations ?? [])
    .filter((connection) => connection.locationId === locationId)
    .map((connection) => {
      const kind = connection.kind as CharacterLocationConnectionKind
      const family = getCharacterLocationConnectionFamily(kind)
      const sectionGroup = resolveLocationConnectedPartySectionGroup(family)

      return {
        relationshipId: connection.id,
        subjectType: 'character' as const,
        subject: {
          type: 'character' as const,
          id: subjectId,
          name: hit.name,
          slug: subjectId,
          characterType: hit.characterType,
        },
        kind,
        label: getCharacterLocationConnectionDisplayLabel(kind, 'inverse'),
        family,
        priority: getCharacterLocationConnectionPriority(kind),
        sectionGroup,
        sortSectionRank: getLocationConnectedPartySectionRank(sectionGroup),
        sortSubjectName: hit.name,
        sortSubjectId: subjectId,
      }
    })
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

  const [characters, organizations] = await Promise.all([
    CharacterModel.find({
      'connections.locations.locationId': locationId,
    })
      .select({ _id: 1, name: 1, characterType: 1, connections: 1 })
      .lean<CharacterConnectionHit[]>(),
    HomebrewOrganizationModel.find({
      campaignId,
      'connections.locations.locationId': locationId,
    })
      .select({ _id: 1, name: 1, slug: 1, connections: 1 })
      .lean<OrganizationConnectionHit[]>(),
  ])

  const rows = sortConnectedPartyRows([
    ...characters.flatMap((hit) => expandCharacterRows(hit, locationId)),
    ...organizations.flatMap((hit) => expandOrganizationRows(hit, locationId)),
  ])

  const total = rows.length
  const skip = (page - 1) * pageSize
  const pageRows = rows.slice(skip, skip + pageSize).map(toPublicRow)

  return { items: pageRows, total }
}
