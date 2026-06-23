import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/content-create-shell'

export function SpellCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="spells"
      campaignId={campaignId}
      heading="New Spell"
      backHref={ROUTES.content.spells.overview(campaignId)}
    />
  )
}
