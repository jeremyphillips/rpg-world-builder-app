'use client'

import * as React from 'react'

import type { TerritorialAuthorityKind } from '@rpg/contracts'
import { Button, Heading, SemanticText, Text } from '@rpg/ui'

import { ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR } from '../lib/organization-connected-regions.constants'
import { ORGANIZATION_TERRITORIAL_INVERSE_ADD_LABEL } from '../lib/organization-territorial-authority-inverse.lib'
import {
  formatConnectedRegionsCount,
  ORGANIZATION_SECTION_LABELS,
  type OrganizationConnectedRegionsViewModel,
} from '../lib/organization-display'
import { OrganizationConnectedRegionPreviewList } from './organization-connected-region-preview-list.client'
import { OrganizationTerritorialAuthorityPickerDrawer } from './organization-territorial-authority-picker-drawer.client'

export type OrganizationConnectedRegionsSectionProps = {
  campaignId: string
  connectedRegions: OrganizationConnectedRegionsViewModel
  canWriteInverseTerritorial?: boolean
  isPending?: boolean
  isError?: boolean
  errorText?: string
  mutationError?: string | null
  isMutationPending?: boolean
  pendingRelationshipId?: string
  onAddTerritorialAuthority?: (regionId: string, kind: TerritorialAuthorityKind) => Promise<void>
  onRemoveTerritorialAuthority?: (input: {
    regionId: string
    relationshipId: string
  }) => Promise<void>
  onUpdateTerritorialAuthorityKind?: (input: {
    regionId: string
    relationshipId: string
    kind: TerritorialAuthorityKind
  }) => Promise<void>
}

export function OrganizationConnectedRegionsSection({
  campaignId,
  connectedRegions,
  canWriteInverseTerritorial = false,
  isPending = false,
  isError = false,
  errorText = ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR,
  mutationError = null,
  isMutationPending = false,
  pendingRelationshipId,
  onAddTerritorialAuthority,
  onRemoveTerritorialAuthority,
  onUpdateTerritorialAuthorityKind,
}: OrganizationConnectedRegionsSectionProps) {
  const { previewItems, total, emptyText } = connectedRegions
  const visiblePreviewItems = previewItems.map((item) => ({
    ...item,
    canEditTerritorial: canWriteInverseTerritorial && item.canEditTerritorial,
  }))
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [authorityKind, setAuthorityKind] = React.useState<TerritorialAuthorityKind | null>(null)

  const handlePickerOpenChange = (open: boolean) => {
    setPickerOpen(open)
    if (!open) {
      setAuthorityKind(null)
    }
  }

  const handleSelectRegion = async (regionId: string) => {
    if (!authorityKind || !onAddTerritorialAuthority) return
    await onAddTerritorialAuthority(regionId, authorityKind)
    setPickerOpen(false)
    setAuthorityKind(null)
  }

  return (
    <section aria-labelledby="organization-connected-regions-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Heading variant="group" as="h2" id="organization-connected-regions-heading">
          {ORGANIZATION_SECTION_LABELS.connectedRegions}
        </Heading>
        {canWriteInverseTerritorial ? (
          <Button
            type="button"
            variant="outline"
            disabled={isMutationPending}
            onClick={() => setPickerOpen(true)}
          >
            {ORGANIZATION_TERRITORIAL_INVERSE_ADD_LABEL}
          </Button>
        ) : null}
      </div>

      {mutationError ? <SemanticText tone="destructive">{mutationError}</SemanticText> : null}

      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : isError ? (
        <Text variant="muted">{errorText}</Text>
      ) : total === 0 ? (
        <Text variant="muted">{emptyText}</Text>
      ) : (
        <div className="space-y-3">
          <Text variant="muted">{formatConnectedRegionsCount(total)}</Text>
          <OrganizationConnectedRegionPreviewList
            items={visiblePreviewItems}
            total={total}
            pendingRelationshipId={pendingRelationshipId}
            onRemoveTerritorialAuthority={
              onRemoveTerritorialAuthority
                ? ({ regionId, relationshipId }) =>
                    onRemoveTerritorialAuthority({ regionId, relationshipId })
                : undefined
            }
            onUpdateTerritorialAuthorityKind={onUpdateTerritorialAuthorityKind}
          />
        </div>
      )}

      {canWriteInverseTerritorial && pickerOpen ? (
        <OrganizationTerritorialAuthorityPickerDrawer
          open={pickerOpen}
          onOpenChange={handlePickerOpenChange}
          campaignId={campaignId}
          authorityKind={authorityKind}
          onAuthorityKindChange={setAuthorityKind}
          onSelectRegion={handleSelectRegion}
        />
      ) : null}
    </section>
  )
}
