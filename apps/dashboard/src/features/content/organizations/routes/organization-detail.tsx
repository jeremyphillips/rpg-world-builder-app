import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { RichTextContent } from '@rpg/ui'
import type { Organization } from '@rpg/contracts'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
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
import { buildOrganizationContentDisplayImageInput } from '../../lib/detail/page/content-display-image-input'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge'
import { useClasses } from '../../classes/hooks/use-classes'
import { useSpecies } from '../../species/hooks/use-species'
import { OrganizationLocationConnectionsDetailSection } from '../components/location-connections/organization-location-connections-detail-section'
import { OrganizationMembersDetailSection } from '../components/members/organization-members-detail-section'
import { useOrganizations } from '../hooks/use-organizations'
import {
  buildOrganizationDetailViewModel,
  ORGANIZATION_EMPTY_SECTION_TEXT,
} from '../lib/organization-display'

export function OrganizationDetailContent({
  organization,
  campaignId,
}: {
  organization: Organization
  campaignId: string
}) {
  useSetBreadcrumbLabel(organization.name)

  const { data: classes = [] } = useClasses(campaignId)
  const { data: species = [] } = useSpecies(campaignId)

  const viewModel = useMemo(
    () =>
      buildOrganizationDetailViewModel(
        organization,
        {
          previewItems: [],
          total: 0,
          emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
        },
        classes,
        species,
      ),
    [classes, organization, species],
  )

  return (
    <ContentDetailLayout
      contentTypeKey="organizations"
      name={organization.name}
      nameBadge={<ContentStatusNameBadge status={organization.status} />}
      displayImage={getContentDisplayImage(
        buildOrganizationContentDisplayImageInput(organization, 'detail'),
      )}
      displayFallback={resolveDashboardDetailDisplayFallback('organization')}
      imageName={organization.name}
      campaignId={campaignId}
      editHref={contentEditHref('organizations', campaignId, organization.id)}
      statRows={viewModel.statRows}
      heroDescription={false}
      descriptionContent={
        viewModel.description ? (
          <RichTextContent html={viewModel.description} size="md" tone="muted" />
        ) : undefined
      }
    >
      <div className="space-y-8">
        <OrganizationMembersDetailSection campaignId={campaignId} organization={organization} />
        <OrganizationLocationConnectionsDetailSection
          campaignId={campaignId}
          organization={organization}
        />
      </div>
    </ContentDetailLayout>
  )
}

export function OrganizationDetail() {
  const { campaignId = '', organizationId = '' } = useParams<{
    campaignId: string
    organizationId: string
  }>()
  const { data: organizations = [], isPending, isError } = useOrganizations(campaignId)
  return (
    <ContentDetailResolver
      isPending={isPending}
      isError={isError}
      items={organizations}
      itemId={organizationId}
      loadErrorLabel={formatContentListLoadErrorMessage('organizations')}
      notFoundLabel={formatContentNotFoundMessage('organizations')}
    >
      {(organization) => (
        <OrganizationDetailContent organization={organization} campaignId={campaignId} />
      )}
    </ContentDetailResolver>
  )
}
