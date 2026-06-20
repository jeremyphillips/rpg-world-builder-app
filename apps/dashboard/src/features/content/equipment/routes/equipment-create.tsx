import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/content-create-shell'

export function EquipmentCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="equipment"
      campaignId={campaignId}
      heading="New Equipment"
      backHref={ROUTES.content.equipment.overview(campaignId)}
    />
  )
}
