import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/content-create-shell'

export function ArmorCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="armor"
      campaignId={campaignId}
      heading="New Armor"
      backHref={ROUTES.content.armor.overview(campaignId)}
    />
  )
}
