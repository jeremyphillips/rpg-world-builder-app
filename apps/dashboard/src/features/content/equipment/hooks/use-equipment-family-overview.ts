import { ROUTES } from '@/app/routes'

import { useEquipment } from '../hooks/use-equipment'
import { useFamilyTableConfig } from '../hooks/use-family-table-config'
import {
  familyPathToEquipmentKind,
  getEquipmentFamilyLabel,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

export function useEquipmentFamilyOverview(campaignId: string, family: EquipmentFamilyPath) {
  const kind = familyPathToEquipmentKind(family)
  const { data: equipment = [], isPending, isError } = useEquipment(campaignId)
  const {
    tableConfig,
    isPending: columnsPending,
    isError: columnsError,
  } = useFamilyTableConfig(campaignId, family)
  const heading = getEquipmentFamilyLabel(family)
  const filtered = kind ? equipment.filter((item) => item.kind === kind) : []

  return {
    heading,
    filtered,
    tableConfig,
    isPending: isPending || columnsPending,
    isError: isError || columnsError,
    newHref: ROUTES.content.equipment.create(campaignId, family),
    newLabel: `New ${heading.replace(/s$/, '')}`,
  }
}
