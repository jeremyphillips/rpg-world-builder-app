import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Organization, TerritorialAuthorityKind } from '@rpg/contracts'
import { ApiError } from '@rpg/contracts'
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
import { OrganizationConnectedCharactersSection } from '../components/organization-connected-characters-section.client'
import { OrganizationConnectedRegionsSection } from '../components/organization-connected-regions-section.client'
import { useOrganizationConnectedCharacters } from '../hooks/use-organization-connected-characters'
import { useOrganizationConnectedRegions } from '../hooks/use-organization-connected-regions'
import { useOrganizationTerritorialAuthorityMutations } from '../hooks/use-organization-territorial-authority-mutations'
import { useOrganizations } from '../hooks/use-organizations'
import { buildOrganizationConnectedCharacterCards } from '../lib/build-organization-connected-character-cards'
import { buildOrganizationConnectedRegionCards } from '../lib/build-organization-connected-region-cards'
import {
  buildOrganizationDetailViewModel,
  ORGANIZATION_EMPTY_SECTION_TEXT,
} from '../lib/organization-display'
import {
  canEditOrganizationTerritorialAuthorityInverse,
  ORGANIZATION_TERRITORIAL_INVERSE_MUTATION_ERROR,
} from '../lib/organization-territorial-authority-inverse.lib'

export function OrganizationDetailContent({
  organization,
  campaignId,
}: {
  organization: Organization
  campaignId: string
}) {
  useSetBreadcrumbLabel(organization.name)
  const canManage = useCanManageCampaign(campaignId)
  const canWriteInverseTerritorial = canEditOrganizationTerritorialAuthorityInverse(canManage)
  const connectedCharactersQuery = useOrganizationConnectedCharacters(campaignId, organization.id)
  const connectedRegionsQuery = useOrganizationConnectedRegions(campaignId, organization.id)
  const territorialMutations = useOrganizationTerritorialAuthorityMutations(
    campaignId,
    organization.id,
  )

  const mutationError =
    territorialMutations.error instanceof ApiError
      ? territorialMutations.error.message
      : territorialMutations.error
        ? ORGANIZATION_TERRITORIAL_INVERSE_MUTATION_ERROR
        : null

  const viewModel = useMemo(() => {
    const connectedCharacters = connectedCharactersQuery.data
      ? buildOrganizationConnectedCharacterCards(connectedCharactersQuery.data, { campaignId })
      : {
          previewItems: [],
          total: 0,
        }

    const connectedRegions = connectedRegionsQuery.data
      ? buildOrganizationConnectedRegionCards(connectedRegionsQuery.data, {
          campaignId,
          canWriteInverseTerritorial,
        })
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
  }, [
    campaignId,
    canWriteInverseTerritorial,
    connectedCharactersQuery.data,
    connectedRegionsQuery.data,
    organization,
  ])

  const handleAddTerritorialAuthority = async (
    regionId: string,
    kind: TerritorialAuthorityKind,
  ) => {
    territorialMutations.resetErrors()
    await territorialMutations.addTerritorialAuthority(regionId, kind)
  }

  const handleRemoveTerritorialAuthority = async (input: {
    regionId: string
    relationshipId: string
  }) => {
    territorialMutations.resetErrors()
    await territorialMutations.removeTerritorialAuthority(input.regionId, input.relationshipId)
  }

  const handleUpdateTerritorialAuthorityKind = async (input: {
    regionId: string
    relationshipId: string
    kind: TerritorialAuthorityKind
  }) => {
    territorialMutations.resetErrors()
    await territorialMutations.updateTerritorialAuthorityKind(
      input.regionId,
      input.relationshipId,
      input.kind,
    )
  }

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
            campaignId={campaignId}
            connectedRegions={viewModel.connectedRegions}
            canWriteInverseTerritorial={canWriteInverseTerritorial}
            isPending={connectedRegionsQuery.isPending}
            isError={connectedRegionsQuery.isError}
            mutationError={mutationError}
            isMutationPending={territorialMutations.isPending}
            pendingRelationshipId={territorialMutations.pendingRelationshipId}
            onAddTerritorialAuthority={
              canWriteInverseTerritorial ? handleAddTerritorialAuthority : undefined
            }
            onRemoveTerritorialAuthority={
              canWriteInverseTerritorial ? handleRemoveTerritorialAuthority : undefined
            }
            onUpdateTerritorialAuthorityKind={
              canWriteInverseTerritorial ? handleUpdateTerritorialAuthorityKind : undefined
            }
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
