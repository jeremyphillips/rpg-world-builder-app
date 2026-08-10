import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Organization } from '@rpg/contracts'
import { RichTextContent } from '@rpg/ui'

import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { WidePage } from '@/components/layout/wide-page'
import {
  formatContentListLoadErrorMessage,
  formatContentNotFoundMessage,
} from '@/features/content/lib/content-type-labels'
import { contentEditHref } from '../../lib/detail/content-edit-href'
import { ContentDetailLayout } from '../../lib/detail/content-detail-layout'
import { ContentDetailResolver } from '../../lib/detail/content-detail-resolver'
import { getContentImageUrl } from '../../lib/detail/content-image-url'
import { ContentStatusNameBadge } from '../../lib/overview/content-status-name-badge.client'
import { OrganizationLocationConnectionsDetailSection } from '../components/organization-location-connections-detail-section.client'
import { OrganizationMembersDetailSection } from '../components/organization-members-detail-section.client'
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

  const viewModel = useMemo(
    () =>
      buildOrganizationDetailViewModel(organization, {
        previewItems: [],
        total: 0,
        emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
      }),
    [organization],
  )

  return (
    <WidePage>
      <ContentDetailLayout
        name={organization.name}
        nameBadge={<ContentStatusNameBadge status={organization.status} />}
        imageUrl={getContentImageUrl(organization.imageKey)}
        imageName={organization.name}
        campaignId={campaignId}
        editHref={contentEditHref('organizations', campaignId, organization.id)}
        statRows={viewModel.statRows}
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
    </WidePage>
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
