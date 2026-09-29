import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { RichTextContent } from '@rpg/ui'
import type { Location } from '@rpg/contracts'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useCanManageCampaign } from '@/features/campaign'
import {
  formatContentListLoadErrorMessage,
  formatContentNotFoundMessage,
} from '@/features/content/lib/content-type-labels'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/page/content-detail-resolver'
import {
  getContentDisplayImage,
  resolveDashboardDetailDisplayFallback,
} from '../../lib/detail/page/content-display-image'
import { buildLocationContentDisplayImageInput } from '../../lib/detail/page/content-display-image-input'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { LocationChildrenSection } from '../components/hierarchy/location-children-section'
import { LocationConnectedPartiesDetailSections } from '../components/connected-parties/location-connected-parties-detail-sections'
import { LocationDetailMetadata } from '../components/detail/location-detail-metadata'
import { useLocations } from '../hooks/use-locations'
import { buildLocationDetailViewModel } from '../lib/location-display'
import { resolveLocationAuthoringType } from '../lib/location-authoring-type'

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
    <ContentDetailLayout
      contentTypeKey="locations"
      name={location.name}
      nameBadge={<ContentStatusNameBadge status={location.status} />}
      displayImage={getContentDisplayImage(
        buildLocationContentDisplayImageInput(location, 'detail'),
      )}
      displayFallback={resolveDashboardDetailDisplayFallback('location')}
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
      heroDescription={false}
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
          parentAuthoringType={resolveLocationAuthoringType(location)}
          campaignId={campaignId}
          campaignLocations={locations}
        />
        <LocationConnectedPartiesDetailSections campaignId={campaignId} location={location} />
      </div>
    </ContentDetailLayout>
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
