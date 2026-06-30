import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
// Registers the equipment form def into the content form registry on module load.
import '../lib/equipment-form-def'
import {
  familyPathToEquipmentKind,
  getEquipmentFamilyLabel,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

type EquipmentFamilyCreateProps = {
  family: EquipmentFamilyPath
}

export function EquipmentFamilyCreate({ family }: EquipmentFamilyCreateProps) {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const kind = familyPathToEquipmentKind(family)
  const label = getEquipmentFamilyLabel(family)

  return (
    <ContentCreateShell
      contentType="equipment"
      campaignId={campaignId}
      heading={`New ${label.replace(/s$/, '')}`}
      backHref={ROUTES.content.equipment.family(campaignId, family)}
      initialValues={kind ? { kind } : undefined}
      formCtx={
        kind
          ? {
              equipmentKind: kind,
              equipmentFamily: family,
            }
          : undefined
      }
    />
  )
}
