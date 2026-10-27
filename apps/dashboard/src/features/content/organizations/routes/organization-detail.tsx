import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { RichTextContent } from '@rpg/ui'
import type { ContentTypeKey, Organization } from '@rpg/contracts'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import {
  formatContentListLoadErrorMessage,
  formatContentNotFoundMessage,
} from '@/features/content/lib/content-type-labels'
import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'
import { ContentDetailQueryStatus } from '../../lib/detail/page/content-detail-query-status'
import { contentEditHref } from '../../lib/detail/page/content-edit-href'
import { ContentDetailLayout } from '../../lib/detail/page/content-detail-layout'
import { contentDetailProseProps } from '../../lib/detail/page/content-detail-prose'
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
import { OrganizationMembershipTitlesDetailSection } from '../components/members/organization-membership-titles-detail-section'
import { OrganizationMembersDetailSection } from '../components/members/organization-members-detail-section'
import { useOrganizations } from '../hooks/use-organizations'
import {
  buildOrganizationDetailViewModel,
  ORGANIZATION_EMPTY_SECTION_TEXT,
  ORGANIZATION_MEMBER_CLASS_AFFINITIES_LABEL,
  ORGANIZATION_MEMBER_SPECIES_AFFINITIES_LABEL,
} from '../lib/organization-display'

function catalogSnapshot<T>(query: {
  data: T[] | undefined
  isPending: boolean
  isLoadingError: boolean
}): readonly T[] | undefined {
  if (query.isPending || query.isLoadingError) return undefined
  return query.data ?? []
}

function withAffinityQueryStatus(
  row: ContentStatRowData,
  query: { isPending: boolean; isLoadingError: boolean },
  subject: Extract<ContentTypeKey, 'classes' | 'species'>,
): ContentStatRowData {
  if (query.isPending) {
    return { ...row, valueContent: <ContentDetailQueryStatus status="pending" /> }
  }
  if (query.isLoadingError) {
    return {
      ...row,
      valueContent: <ContentDetailQueryStatus status="error" subject={subject} />,
    }
  }
  return row
}

export function OrganizationDetailContent({
  organization,
  campaignId,
}: {
  organization: Organization
  campaignId: string
}) {
  useSetBreadcrumbLabel(organization.name)

  const classesQuery = useClasses(campaignId)
  const speciesQuery = useSpecies(campaignId)
  const classCatalog = catalogSnapshot(classesQuery)
  const speciesCatalog = catalogSnapshot(speciesQuery)
  const classesPending = classesQuery.isPending
  const classesLoadingError = classesQuery.isLoadingError
  const speciesPending = speciesQuery.isPending
  const speciesLoadingError = speciesQuery.isLoadingError

  const viewModel = useMemo(() => {
    const built = buildOrganizationDetailViewModel(
      organization,
      {
        previewItems: [],
        total: 0,
        emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
      },
      classCatalog,
      speciesCatalog,
    )

    return {
      ...built,
      statRows: built.statRows.map((row) => {
        if (row.label === ORGANIZATION_MEMBER_CLASS_AFFINITIES_LABEL) {
          return withAffinityQueryStatus(
            row,
            { isPending: classesPending, isLoadingError: classesLoadingError },
            'classes',
          )
        }
        if (row.label === ORGANIZATION_MEMBER_SPECIES_AFFINITIES_LABEL) {
          return withAffinityQueryStatus(
            row,
            { isPending: speciesPending, isLoadingError: speciesLoadingError },
            'species',
          )
        }
        return row
      }),
    }
  }, [
    classCatalog,
    classesLoadingError,
    classesPending,
    organization,
    speciesCatalog,
    speciesLoadingError,
    speciesPending,
  ])

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
          <RichTextContent html={viewModel.description} {...contentDetailProseProps} />
        ) : undefined
      }
    >
      <div className="space-y-8">
        <OrganizationMembersDetailSection campaignId={campaignId} organization={organization} />
        <OrganizationMembershipTitlesDetailSection organization={organization} />
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
