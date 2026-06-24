import type { Equipment, EquipmentKind } from '@rpg/contracts'
import { Text } from '@rpg/ui'

export const EQUIPMENT_FAMILY_MISMATCH_MESSAGE =
  'This item does not belong to this equipment family.'

/** True once the list query settled and the entity kind disagrees with the route family. */
export function shouldShowEquipmentFamilyMismatch(
  item: Equipment | undefined,
  expectedKind: EquipmentKind | undefined,
  isPending: boolean,
  isError: boolean,
): boolean {
  return !isPending && !isError && !!item && !!expectedKind && item.kind !== expectedKind
}

export function EquipmentFamilyMismatchAlert() {
  return (
    <Text variant="destructive" role="alert">
      {EQUIPMENT_FAMILY_MISMATCH_MESSAGE}
    </Text>
  )
}
