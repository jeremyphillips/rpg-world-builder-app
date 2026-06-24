import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/content-create-shell'

export function WeaponCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="equipment"
      campaignId={campaignId}
      heading="New Weapon"
      backHref={ROUTES.content.equipment.family(campaignId, 'weapons')}
    />
  )
}
