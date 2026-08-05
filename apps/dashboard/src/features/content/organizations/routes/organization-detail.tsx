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
import { OrganizationConnectedCharactersSection } from '../components/organization-connected-characters-section.client'
import { OrganizationConnectedRegionsSection } from '../components/organization-connected-regions-section.client'
import { useOrganizationConnectedCharacters } from '../hooks/use-organization-connected-characters'
import { useOrganizationConnectedRegions } from '../hooks/use-organization-connected-regions'
import { useOrganizations } from '../hooks/use-organizations'
import { buildOrganizationConnectedCharacterCards } from '../lib/build-organization-connected-character-cards'
import { buildOrganizationConnectedRegionCards } from '../lib/build-organization-connected-region-cards'
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
  const connectedCharactersQuery = useOrganizationConnectedCharacters(campaignId, organization.id)
  const connectedRegionsQuery = useOrganizationConnectedRegions(campaignId, organization.id)
  const viewModel = useMemo(() => {
    const connectedCharacters = connectedCharactersQuery.data
      ? buildOrganizationConnectedCharacterCards(connectedCharactersQuery.data, { campaignId })
      : {
          previewItems: [],
          total: 0,
        }

    const connectedRegions = connectedRegionsQuery.data
      ? buildOrganizationConnectedRegionCards(connectedRegionsQuery.data, { campaignId })
      : {
          previewItems: [],
          total: 0,
        }

    return buildOrganizationDetailViewModel(
      organization,
      {
        ...connectedCharacters,
        emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedCharacters,
      },
      {
        ...connectedRegions,
        emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.connectedRegions,
      },
    )
  }, [campaignId, connectedCharactersQuery.data, connectedRegionsQuery.data, organization])

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
          <OrganizationConnectedRegionsSection
            connectedRegions={viewModel.connectedRegions}
            isPending={connectedRegionsQuery.isPending}
            isError={connectedRegionsQuery.isError}
          />
          <OrganizationConnectedCharactersSection
            connectedCharacters={viewModel.connectedCharacters}
            isPending={connectedCharactersQuery.isPending}
            isError={connectedCharactersQuery.isError}
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
