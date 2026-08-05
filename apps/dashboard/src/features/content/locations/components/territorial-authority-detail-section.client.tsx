'use client'

import * as React from 'react'

import type { Location, Organization } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import { useOrganizations } from '@/features/content'

import { resolveLocationAuthoringType } from '../lib/location-authoring-type'
import {
  buildTerritorialAuthorityRows,
  groupTerritorialAuthorityRelationshipsByKind,
  shouldShowTerritorialAuthoritySection,
  TERRITORIAL_AUTHORITY_EMPTY_TEXT,
  TERRITORIAL_AUTHORITY_SECTION_LABEL,
} from '../lib/territorial-authority.lib'
import { TerritorialAuthorityRelationshipList } from './territorial-authority-relationship-list.client'

export function TerritorialAuthorityDetailSection({
  location,
  campaignId,
}: {
  location: Location
  campaignId: string
}) {
  const isRegion = location.kind === 'region'
  const relationships = React.useMemo(
    () => (isRegion ? (location.territorialAuthority ?? []) : []),
    [isRegion, location],
  )
  const authoringType = resolveLocationAuthoringType(location)
  const showSection = shouldShowTerritorialAuthoritySection({
    authoringType,
    relationships,
  })

  const { data: organizations = [] } = useOrganizations(campaignId)

  const organizationsById = React.useMemo(
    () =>
      new Map(organizations.map((organization: Organization) => [organization.id, organization])),
    [organizations],
  )

  const rows = React.useMemo(
    () =>
      buildTerritorialAuthorityRows({
        relationships,
        campaignId,
        organizationsById,
      }),
    [campaignId, organizationsById, relationships],
  )

  const groupedRows = React.useMemo(
    () => groupTerritorialAuthorityRelationshipsByKind(relationships),
    [relationships],
  )

  const rowsById = React.useMemo(
    () => new Map(rows.map((row) => [row.relationship.id, row])),
    [rows],
  )

  if (!isRegion || !showSection) {
    return null
  }

  return (
    <section className="space-y-4" aria-labelledby="location-territorial-authority-heading">
      <Heading variant="label" as="h2" id="location-territorial-authority-heading">
        {TERRITORIAL_AUTHORITY_SECTION_LABEL}
      </Heading>

      {relationships.length === 0 ? (
        <Text variant="muted">{TERRITORIAL_AUTHORITY_EMPTY_TEXT}</Text>
      ) : (
        <TerritorialAuthorityRelationshipList
          groupedRows={groupedRows}
          rowsById={rowsById}
          variant="detail"
        />
      )}
    </section>
  )
}
