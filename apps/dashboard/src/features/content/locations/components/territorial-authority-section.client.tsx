'use client'

import * as React from 'react'
import { useParams } from 'react-router-dom'
import { Controller, useFormContext } from 'react-hook-form'

import {
  type TerritorialAuthorityKind,
  type TerritorialAuthorityRelationship,
} from '@rpg/contracts'
import { Badge, Button, ContentCardRemoveButton, Heading, InsetPanel, Text } from '@rpg/ui'

import { useOrganizations } from '@/features/content'

import { ContentEntityCard } from '../../lib/content-entity-card.client'

import { TerritorialAuthorityPickerDrawer } from './territorial-authority-picker-drawer.client'
import {
  appendTerritorialAuthorityRelationship,
  buildTerritorialAuthorityRows,
  groupTerritorialAuthorityRelationshipsByKind,
  isTerritorialAuthorityAuthoringSupported,
  removeTerritorialAuthorityRelationship,
  TERRITORIAL_AUTHORITY_ADD_LABEL,
  TERRITORIAL_AUTHORITY_EMPTY_TEXT,
  TERRITORIAL_AUTHORITY_FIELD,
  TERRITORIAL_AUTHORITY_SECTION_DESCRIPTION,
} from '../lib/territorial-authority.lib'
import {
  resolveAuthoringTypeFromFormValues,
  type LocationAuthoringType,
} from '../lib/location-authoring-type'
import type { LocationFormValues } from '../lib/location-form-fields'

export type TerritorialAuthoritySectionProps = {
  campaignId?: string
}

type TerritorialAuthoritySectionContentProps = {
  campaignId: string
  relationships: TerritorialAuthorityRelationship[]
  onRelationshipsChange: (next: TerritorialAuthorityRelationship[]) => void
}

function TerritorialAuthoritySectionContent({
  campaignId,
  relationships,
  onRelationshipsChange,
}: TerritorialAuthoritySectionContentProps) {
  const { watch } = useFormContext<LocationFormValues>()
  const authoringType = resolveAuthoringTypeFromFormValues(watch()) as LocationAuthoringType
  const canAddRelationships = isTerritorialAuthorityAuthoringSupported(authoringType)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [authorityKind, setAuthorityKind] = React.useState<TerritorialAuthorityKind | null>(null)

  const { data: organizations = [] } = useOrganizations(campaignId)

  const organizationsById = React.useMemo(
    () => new Map(organizations.map((organization) => [organization.id, organization])),
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

  const handleOpenPicker = () => {
    if (!canAddRelationships) return
    setAuthorityKind(null)
    setPickerOpen(true)
  }

  const handlePickerOpenChange = (open: boolean) => {
    setPickerOpen(open)
    if (!open) {
      setAuthorityKind(null)
    }
  }

  const handleSelectOrganization = (organizationId: string) => {
    if (!authorityKind) return

    onRelationshipsChange(
      appendTerritorialAuthorityRelationship({
        relationships,
        organizationId,
        kind: authorityKind,
      }),
    )
  }

  const handleRemoveRelationship = (relationshipId: string) => {
    onRelationshipsChange(removeTerritorialAuthorityRelationship(relationships, relationshipId))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Text variant="muted">{TERRITORIAL_AUTHORITY_SECTION_DESCRIPTION}</Text>
        {canAddRelationships ? (
          <Button type="button" variant="outline" onClick={handleOpenPicker}>
            {TERRITORIAL_AUTHORITY_ADD_LABEL}
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <InsetPanel borderStyle="dashed" surface={{}} size="md" align="center" className="py-8">
          <InsetPanel.Text>{TERRITORIAL_AUTHORITY_EMPTY_TEXT}</InsetPanel.Text>
        </InsetPanel>
      ) : (
        <div className="space-y-6">
          {[...groupedRows.entries()].map(([kind, kindRelationships]) => {
            const kindLabel = rowsById.get(kindRelationships[0]?.id ?? '')?.kindLabel ?? kind
            return (
              <div key={kind} className="space-y-2">
                <Heading variant="label" as="h4">
                  {kindLabel}
                </Heading>
                <div className="space-y-2" aria-label={kindLabel}>
                  {kindRelationships.map((relationship) => {
                    const row = rowsById.get(relationship.id)
                    if (!row) return null

                    return (
                      <ContentEntityCard
                        key={relationship.id}
                        density="compact"
                        surface="card"
                        heading={row.organizationLabel}
                        subheading={row.organizationSummary}
                        endSlot={
                          <div className="flex items-center gap-2">
                            {row.organizationUnresolved ? (
                              <Badge tone="warning">Unavailable</Badge>
                            ) : null}
                            <ContentCardRemoveButton
                              label={`${row.kindLabel}: ${row.organizationLabel}`}
                              onRemove={() => handleRemoveRelationship(relationship.id)}
                            />
                          </div>
                        }
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {canAddRelationships ? (
        <TerritorialAuthorityPickerDrawer
          open={pickerOpen}
          onOpenChange={handlePickerOpenChange}
          campaignId={campaignId}
          authoringType={authoringType}
          authorityKind={authorityKind}
          onAuthorityKindChange={setAuthorityKind}
          onSelectOrganization={handleSelectOrganization}
        />
      ) : null}
    </div>
  )
}

export function TerritorialAuthoritySection({
  campaignId: campaignIdProp,
}: TerritorialAuthoritySectionProps = {}) {
  const { campaignId: campaignIdParam = '' } = useParams<{ campaignId: string }>()
  const campaignId = campaignIdProp ?? campaignIdParam
  const { control } = useFormContext<LocationFormValues>()

  return (
    <Controller
      name={TERRITORIAL_AUTHORITY_FIELD}
      control={control}
      render={({ field }) => (
        <TerritorialAuthoritySectionContent
          campaignId={campaignId}
          relationships={(field.value ?? []) as TerritorialAuthorityRelationship[]}
          onRelationshipsChange={field.onChange}
        />
      )}
    />
  )
}
