import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/content-edit-shell'
import { useWeapons } from '../hooks/use-weapons'

export function WeaponEdit() {
  const { campaignId = '', weaponId = '' } = useParams<{
    campaignId: string
    weaponId: string
  }>()
  const { isPending, isError } = useWeapons(campaignId)

  return (
    <ContentEditShell
      contentType="equipment"
      campaignId={campaignId}
      entityId={weaponId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel="Could not load weapons."
      notFoundLabel="Weapon not found."
      backHref={ROUTES.content.equipment.detail(campaignId, 'weapons', weaponId)}
      formCtx={{ equipmentKind: 'weapon', equipmentFamily: 'weapons' }}
    />
  )
}
