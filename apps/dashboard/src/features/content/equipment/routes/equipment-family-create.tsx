import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/content-create-shell'
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
    />
  )
}
