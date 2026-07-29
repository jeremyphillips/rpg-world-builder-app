import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import {
  formatContentListLoadErrorMessage,
  formatContentNotFoundMessage,
} from '@/features/content/lib/content-type-labels'
import { ContentEditShell } from '../../lib/forms/shells/content-edit-shell'
import { useOrganizations } from '../hooks/use-organizations'
import '../lib/organization-form-def'

export function OrganizationEdit() {
  const { campaignId = '', organizationId = '' } = useParams<{
    campaignId: string
    organizationId: string
  }>()
  const { isPending, isError } = useOrganizations(campaignId)
  return (
    <ContentEditShell
      contentType="organizations"
      campaignId={campaignId}
      entityId={organizationId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel={formatContentListLoadErrorMessage('organizations')}
      notFoundLabel={formatContentNotFoundMessage('organizations')}
      backHref={ROUTES.content.organizations.detail(campaignId, organizationId)}
      overviewHref={ROUTES.content.organizations.overview(campaignId)}
      contentTypeKey="organizations"
    />
  )
}
