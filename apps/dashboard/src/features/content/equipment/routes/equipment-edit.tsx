import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/content-edit-shell'
import { useEquipment } from '../hooks/use-equipment'

export function EquipmentEdit() {
  const { campaignId = '', equipmentId = '' } = useParams<{
    campaignId: string
    equipmentId: string
  }>()
  const { isPending, isError } = useEquipment(campaignId)

  return (
    <ContentEditShell
      contentType="equipment"
      campaignId={campaignId}
      entityId={equipmentId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel="Could not load equipment."
      notFoundLabel="Equipment not found."
      backHref={ROUTES.content.equipment.detail(campaignId, equipmentId)}
    />
  )
}
