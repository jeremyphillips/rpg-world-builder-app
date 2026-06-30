import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/forms/shells/content-edit-shell'
// Registers the equipment form def into the content form registry on module load.
import '../lib/equipment-form-def'
import { useEquipment } from '../hooks/use-equipment'
import { EquipmentFamilyMismatchAlert } from '../lib/shared/equipment-family-mismatch-alert'
import { shouldShowEquipmentFamilyMismatch } from '../lib/shared/equipment-family-route-guard'
import {
  familyPathToEquipmentKind,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

type EquipmentEditProps = {
  family: EquipmentFamilyPath
}

export function EquipmentEdit({ family }: EquipmentEditProps) {
  const { campaignId = '', equipmentId = '' } = useParams<{
    campaignId: string
    equipmentId: string
  }>()
  const { data: equipment = [], isPending, isError } = useEquipment(campaignId)
  const expectedKind = familyPathToEquipmentKind(family)
  const item = equipment.find((entry) => entry.id === equipmentId)

  if (shouldShowEquipmentFamilyMismatch(item, expectedKind, isPending, isError)) {
    return <EquipmentFamilyMismatchAlert />
  }

  return (
    <ContentEditShell
      contentType="equipment"
      campaignId={campaignId}
      entityId={equipmentId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel="Could not load equipment."
      notFoundLabel="Equipment not found."
      backHref={ROUTES.content.equipment.detail(campaignId, family, equipmentId)}
      formCtx={expectedKind ? { equipmentKind: expectedKind, equipmentFamily: family } : undefined}
    />
  )
}
