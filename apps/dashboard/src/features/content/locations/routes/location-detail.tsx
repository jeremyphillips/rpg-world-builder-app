import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Location } from '@rpg/contracts'
import { RichTextContent } from '@rpg/ui'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { WidePage } from '@/components/layout/wide-page'
import { useCanManageCampaign } from '@/features/campaign'
import {
  formatContentListLoadErrorMessage,
  formatContentNotFoundMessage,
} from '@/features/content/lib/content-type-labels'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { getContentImageUrl } from '../../lib/detail/content-image-url'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge.client'
import { LocationChildrenSection } from '../components/location-children-section.client'
import { LocationConnectedPartiesDetailSections } from '../components/location-connected-parties-detail-sections.client'
import { LocationDetailMetadata } from '../components/location-detail-metadata.client'
import { useLocations } from '../hooks/use-locations'
import { buildLocationDetailViewModel } from '../lib/location-display'

export function LocationDetailContent({
  location,
  campaignId,
  locations,
}: {
  location: Location
  campaignId: string
  locations: readonly Location[]
}) {
  useSetBreadcrumbLabel(location.name)
  const canManage = useCanManageCampaign(campaignId)
  const viewModel = useMemo(
    () =>
      buildLocationDetailViewModel(location, {
        locations,
        campaignId,
        canManage,
      }),
    [campaignId, canManage, location, locations],
  )

  return (
    <WidePage>
      <ContentDetailLayout
        name={location.name}
        nameBadge={<ContentStatusNameBadge status={location.status} />}
        imageUrl={getContentImageUrl(location.imageKey)}
        imageName={location.name}
        campaignId={campaignId}
        editHref={contentEditHref('locations', campaignId, location.id)}
        metadata={
          <LocationDetailMetadata
            location={location}
            campaignId={campaignId}
            locations={locations}
            identity={viewModel.identity}
          />
        }
        descriptionContent={
          viewModel.description ? (
            <RichTextContent html={viewModel.description} size="md" tone="muted" />
          ) : undefined
        }
      >
        <div className="space-y-8">
          <LocationChildrenSection
            childrenViewModel={viewModel.children}
            canManage={canManage}
            parentLocationId={location.id}
            parentKind={location.kind}
            campaignId={campaignId}
            campaignLocations={locations}
          />
          <LocationConnectedPartiesDetailSections campaignId={campaignId} location={location} />
        </div>
      </ContentDetailLayout>
    </WidePage>
  )
}

export function LocationDetail() {
  const { campaignId = '', locationId = '' } = useParams<{
    campaignId: string
    locationId: string
  }>()
  const { data: locations = [], isPending, isError } = useLocations(campaignId)

  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={locations}
      itemId={locationId}
      loadErrorLabel={formatContentListLoadErrorMessage('locations')}
      notFoundLabel={formatContentNotFoundMessage('locations')}
    >
      {(location) => (
        <LocationDetailContent location={location} campaignId={campaignId} locations={locations} />
      )}
    </ContentDetailResolver>
  )
}
