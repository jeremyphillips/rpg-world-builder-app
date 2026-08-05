import type {
  LocationPartyAssociation,
  OrganizationConnectedRegionSummary,
  PaginatedItems,
  TerritorialAuthorityRelationship,
} from '@rpg/contracts'
import {
  getAssociationSemanticKey,
  getLocationPartyAssociationSemanticLabel,
  getTerritorialAuthorityLabel,
  getTerritorialAuthorityPriority,
} from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../content.service'
import { HomebrewLocationModel } from '../locations/homebrew-location.model'
import { organizationWriteConfig } from './organizations.config'

type RegionReferenceRecord = {
  _id: unknown
  name: string
  slug: string
  kind: string
  territorialAuthority?: readonly TerritorialAuthorityRelationship[]
  partyAssociations?: readonly LocationPartyAssociation[]
}

type ConnectedRegionRow = OrganizationConnectedRegionSummary & {
  sortRegionName: string
  sortFamilyRank: number
  sortKindRank: number
}

const TERRITORIAL_FAMILY_RANK = 0
const PARTY_FAMILY_RANK = 1

function expandTerritorialRows(
  region: RegionReferenceRecord,
  organizationId: string,
): ConnectedRegionRow[] {
  const regionSummary = {
    id: String(region._id),
    name: region.name,
    slug: region.slug,
  }

  return (region.territorialAuthority ?? [])
    .filter((relationship) => relationship.organizationId === organizationId)
    .map((relationship) => ({
      relationshipFamily: 'territorialAuthority' as const,
      relationshipKind: relationship.kind,
      relationshipLabel: getTerritorialAuthorityLabel(relationship.kind),
      region: regionSummary,
      sortRegionName: region.name,
      sortFamilyRank: TERRITORIAL_FAMILY_RANK,
      sortKindRank: -getTerritorialAuthorityPriority(relationship.kind),
    }))
}

function expandPartyRows(
  region: RegionReferenceRecord,
  organizationId: string,
): ConnectedRegionRow[] {
  const regionSummary = {
    id: String(region._id),
    name: region.name,
    slug: region.slug,
  }

  return (region.partyAssociations ?? [])
    .filter(
      (association) =>
        association.party.kind === 'organization' &&
        association.party.organizationId === organizationId,
    )
    .map((association) => {
      const semanticKey = getAssociationSemanticKey(association)
      return {
        relationshipFamily: 'partyAssociation' as const,
        relationshipKind: semanticKey,
        relationshipLabel: getLocationPartyAssociationSemanticLabel(semanticKey),
        region: regionSummary,
        sortRegionName: region.name,
        sortFamilyRank: PARTY_FAMILY_RANK,
        sortKindRank: 0,
      }
    })
}

function sortConnectedRegionRows(rows: readonly ConnectedRegionRow[]): ConnectedRegionRow[] {
  return [...rows].sort((left, right) => {
    const regionCompare = left.sortRegionName.localeCompare(right.sortRegionName, 'en', {
      sensitivity: 'base',
    })
    if (regionCompare !== 0) return regionCompare

    const familyCompare = left.sortFamilyRank - right.sortFamilyRank
    if (familyCompare !== 0) return familyCompare

    const kindCompare = left.sortKindRank - right.sortKindRank
    if (kindCompare !== 0) return kindCompare

    const labelCompare = left.relationshipLabel.localeCompare(right.relationshipLabel, 'en', {
      sensitivity: 'base',
    })
    if (labelCompare !== 0) return labelCompare

    return left.region.id.localeCompare(right.region.id)
  })
}

function toPublicRow(row: ConnectedRegionRow): OrganizationConnectedRegionSummary {
  return {
    relationshipFamily: row.relationshipFamily,
    relationshipKind: row.relationshipKind,
    relationshipLabel: row.relationshipLabel,
    region: row.region,
  }
}

/**
 * Paginated connected-region rows — territorial authority and party associations listed
 * separately with family labels; no cross-family priority merge.
 */
export async function resolveOrganizationConnectedRegions(input: {
  campaignId: string
  organizationId: string
  page: number
  pageSize: number
}): Promise<PaginatedItems<OrganizationConnectedRegionSummary> | null> {
  const { campaignId, organizationId, page, pageSize } = input

  const catalog = await resolveCatalogForCampaign(organizationWriteConfig.readConfig, campaignId)
  const organization = catalog.find((record) => record.id === organizationId)
  if (!organization) {
    return null
  }

  const regions = await HomebrewLocationModel.find({
    campaignId,
    kind: 'region',
    $or: [
      { territorialAuthority: { $elemMatch: { organizationId } } },
      {
        partyAssociations: {
          $elemMatch: {
            'party.kind': 'organization',
            'party.organizationId': organizationId,
          },
        },
      },
    ],
  })
    .select('_id name slug kind territorialAuthority partyAssociations')
    .lean<RegionReferenceRecord[]>()

  const rows = sortConnectedRegionRows(
    regions.flatMap((region) => [
      ...expandTerritorialRows(region, organizationId),
      ...expandPartyRows(region, organizationId),
    ]),
  )

  const total = rows.length
  const skip = (page - 1) * pageSize
  const pageRows = rows.slice(skip, skip + pageSize).map(toPublicRow)

  return { items: pageRows, total }
}
