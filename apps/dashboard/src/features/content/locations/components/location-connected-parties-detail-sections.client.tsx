'use client'

import * as React from 'react'

import type {
  Location,
  LocationConnectedPartyRow,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { ConfirmDialog, SemanticText, Text } from '@rpg/ui'

import { LocationConnectedPartiesDrawers } from './location-connected-parties-drawers.client'
import { LocationConnectedPartiesSection } from './location-connected-parties-section.client'
import { useLocationConnectedPartiesDetail } from '../hooks/use-location-connected-parties-detail.client'
import { resolveTerritorialRemoveConfirmation } from '../lib/location-connection-surface-copy'

export { LOCATION_CONNECTED_PARTIES_MUTATION_ERROR } from '../hooks/use-location-connected-parties-detail.client'

type DetailState = ReturnType<typeof useLocationConnectedPartiesDetail>

type PendingTerritorialRemove = {
  relationshipId: string
  subjectType: LocationConnectedPartyRow['subject']['type']
  subjectId: string
  organizationName: string
  kind: OrganizationLocationConnectionKind
}

function LocationConnectedPartiesQueryState({ detail }: { detail: DetailState }) {
  if (detail.connectedPartiesQuery.isPending) {
    return <Text variant="muted">Loading connected parties…</Text>
  }

  if (detail.connectedPartiesQuery.isError) {
    return <Text variant="muted">Could not load connected parties for this location.</Text>
  }

  return null
}

// fallow-ignore-next-line complexity
function LocationConnectedPartiesSections({
  campaignId,
  location,
  detail,
}: {
  campaignId: string
  location: Location
  detail: DetailState
}) {
  const [pendingRemove, setPendingRemove] = React.useState<PendingTerritorialRemove | null>(null)

  const handleTerritorialRemoveRequest = React.useCallback(
    async (input: {
      relationshipId: string
      subjectType: LocationConnectedPartyRow['subject']['type']
      subjectId: string
    }) => {
      const row = detail.rows.find((candidate) => candidate.relationshipId === input.relationshipId)
      if (
        !row ||
        row.subjectType !== 'organization' ||
        row.sectionGroup !== 'territorial_authority'
      ) {
        await detail.handleRemoveConnection(input)
        return
      }

      setPendingRemove({
        ...input,
        organizationName: row.subject.name,
        kind: row.kind,
      })
    },
    [detail],
  )

  const removeConfirmation = pendingRemove
    ? resolveTerritorialRemoveConfirmation({
        organizationName: pendingRemove.organizationName,
        kind: pendingRemove.kind,
        locationName: location.name,
      })
    : null

  const sharedSectionProps = {
    campaignId,
    rows: detail.rows,
    charactersById: detail.characterOptionsById,
    canManage: detail.canWriteInverse,
    isMutationPending: detail.isMutationPending,
    pendingRelationshipId: detail.pendingRelationshipId,
    onEditConnection: detail.canWriteInverse ? detail.handleEditConnection : undefined,
    onChangeTerritorialKind: detail.canWriteInverse
      ? detail.handleChangeTerritorialKind
      : undefined,
    onReplaceTerritorialOrganization: detail.canWriteInverse
      ? detail.handleReplaceTerritorialOrganization
      : undefined,
    onRemoveConnection: detail.canWriteInverse ? handleTerritorialRemoveRequest : undefined,
    canEditRow: detail.canEditRow,
    canRemoveRow: detail.canEditRow,
  }

  return (
    <div className="space-y-8">
      {detail.mutationError ? (
        <SemanticText tone="destructive">{detail.mutationError}</SemanticText>
      ) : null}

      {detail.showTerritorialSection ? (
        <LocationConnectedPartiesSection
          {...sharedSectionProps}
          location={location}
          organizationCandidates={detail.organizationCandidates}
          sectionGroup="territorial_authority"
          showEmptySection={
            detail.canManage ||
            detail.rows.some((row) => row.sectionGroup === 'territorial_authority')
          }
          onAddTerritorialKind={
            detail.canAddOrganizationInverse ? detail.openTerritorialAddDrawer : undefined
          }
        />
      ) : null}

      {detail.showPeopleSection ? (
        <LocationConnectedPartiesSection
          {...sharedSectionProps}
          location={location}
          organizationCandidates={detail.organizationCandidates}
          sectionGroup="people_and_organizations"
          showEmptySection={
            detail.canManage ||
            detail.rows.some((row) => row.sectionGroup === 'people_and_organizations')
          }
          peopleKindSlots={detail.peopleKindSlots}
          canAddToPeopleSection={detail.canAddToPeopleSection}
          onAddPeopleSection={detail.canWriteInverse ? detail.openPeopleSectionAdd : undefined}
        />
      ) : null}

      <LocationConnectedPartiesDrawers location={location} detail={detail} />

      {pendingRemove && removeConfirmation ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setPendingRemove(null)
          }}
          headline={removeConfirmation.heading}
          description={removeConfirmation.body}
          confirmLabel={removeConfirmation.confirm}
          confirmVariant="destructive"
          onConfirm={() => {
            void detail.handleRemoveConnection(pendingRemove).finally(() => setPendingRemove(null))
          }}
        />
      ) : null}
    </div>
  )
}

export function LocationConnectedPartiesDetailSections({
  campaignId,
  location,
}: {
  campaignId: string
  location: Location
}) {
  const detail = useLocationConnectedPartiesDetail(campaignId, location)

  if (detail.connectedPartiesQuery.isPending || detail.connectedPartiesQuery.isError) {
    return <LocationConnectedPartiesQueryState detail={detail} />
  }

  if (!detail.showTerritorialSection && !detail.showPeopleSection) {
    return null
  }

  return (
    <LocationConnectedPartiesSections campaignId={campaignId} location={location} detail={detail} />
  )
}
