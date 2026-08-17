import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
import {
  OrganizationAuthoringFormShell,
  OrganizationAuthoringPresetBridge,
} from '../components/organization-authoring-form-shell.client'
import { useOrganizationAuthoringContext } from '../lib/organization-authoring-context.client'
import '../lib/organization-form-def'

function OrganizationCreateForm({ campaignId }: { campaignId: string }) {
  const { practiceRecommendations } = useOrganizationAuthoringContext()

  return (
    <ContentCreateShell
      contentType="organizations"
      campaignId={campaignId}
      heading={formatContentCreateHeading('organizations')}
      backHref={ROUTES.content.organizations.overview(campaignId)}
      formHeaderPrefix={<OrganizationAuthoringPresetBridge />}
      formCtx={{ organizationPracticeRecommendationIds: practiceRecommendations }}
    />
  )
}

export function OrganizationCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()

  return (
    <OrganizationAuthoringFormShell>
      <OrganizationCreateForm campaignId={campaignId} />
    </OrganizationAuthoringFormShell>
  )
}
