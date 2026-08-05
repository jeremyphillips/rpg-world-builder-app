'use client'

import { Heading, Text } from '@rpg/ui'

import { ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR } from '../lib/organization-connected-regions.constants'
import {
  formatConnectedRegionsCount,
  ORGANIZATION_SECTION_LABELS,
  type OrganizationConnectedRegionsViewModel,
} from '../lib/organization-display'
import { OrganizationConnectedRegionPreviewList } from './organization-connected-region-preview-list.client'

export type OrganizationConnectedRegionsSectionProps = {
  connectedRegions: OrganizationConnectedRegionsViewModel
  isPending?: boolean
  isError?: boolean
  errorText?: string
}

export function OrganizationConnectedRegionsSection({
  connectedRegions,
  isPending = false,
  isError = false,
  errorText = ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR,
}: OrganizationConnectedRegionsSectionProps) {
  const { previewItems, total, emptyText } = connectedRegions

  return (
    <section aria-labelledby="organization-connected-regions-heading" className="space-y-4">
      <Heading variant="group" as="h2" id="organization-connected-regions-heading">
        {ORGANIZATION_SECTION_LABELS.connectedRegions}
      </Heading>

      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : isError ? (
        <Text variant="muted">{errorText}</Text>
      ) : total === 0 ? (
        <Text variant="muted">{emptyText}</Text>
      ) : (
        <div className="space-y-3">
          <Text variant="muted">{formatConnectedRegionsCount(total)}</Text>
          <OrganizationConnectedRegionPreviewList items={previewItems} total={total} />
        </div>
      )}
    </section>
  )
}
