import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
import '../lib/organization-form-def'

export function OrganizationCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="organizations"
      campaignId={campaignId}
      heading={formatContentCreateHeading('organizations')}
      backHref={ROUTES.content.organizations.overview(campaignId)}
    />
  )
}
