import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/create/content-create-shell'
// Registers the feat form def into the content form registry on module load.
import '../lib/feat-form-def'

export function FeatCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="feats"
      campaignId={campaignId}
      heading={formatContentCreateHeading('feats')}
      backHref={ROUTES.content.feats.overview(campaignId)}
    />
  )
}
