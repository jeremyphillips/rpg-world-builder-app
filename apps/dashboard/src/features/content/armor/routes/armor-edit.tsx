import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/content-edit-shell'
import { useArmor } from '../hooks/use-armor'

export function ArmorEdit() {
  const { campaignId = '', armorId = '' } = useParams<{
    campaignId: string
    armorId: string
  }>()
  const { isPending, isError } = useArmor(campaignId)

  return (
    <ContentEditShell
      contentType="equipment"
      campaignId={campaignId}
      entityId={armorId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel="Could not load armor."
      notFoundLabel="Armor not found."
      backHref={ROUTES.content.equipment.detail(campaignId, 'armor', armorId)}
      formCtx={{ equipmentKind: 'armor', equipmentFamily: 'armor' }}
    />
  )
}
