import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/create/content-create-shell'
import '../lib/monster-form-def'

export function MonsterCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="monsters"
      campaignId={campaignId}
      heading={formatContentCreateHeading('monsters')}
      backHref={ROUTES.content.monsters.overview(campaignId)}
    />
  )
}
