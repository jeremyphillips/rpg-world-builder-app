import { Text } from '@rpg/ui'

import { EQUIPMENT_FAMILY_MISMATCH_MESSAGE } from './equipment-family-route-guard'

export function EquipmentFamilyMismatchAlert() {
  return (
    <Text variant="destructive" role="alert">
      {EQUIPMENT_FAMILY_MISMATCH_MESSAGE}
    </Text>
  )
}
