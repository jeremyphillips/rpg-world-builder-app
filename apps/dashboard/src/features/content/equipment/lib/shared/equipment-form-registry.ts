import type { EquipmentKind } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { serviceFormFieldGroup } from '../../services/lib/service-form-fields'
import { mountFormFieldGroup } from '../../mounts/lib/mount-form-fields'
import { toolFormFieldGroup } from '../../tools/lib/tool-form-fields'
import { magicItemFormFieldGroup } from '../../magic-items/lib/magic-item-form-fields'
import { adventuringGearFormFieldGroup } from '../../adventuring-gear/lib/adventuring-gear-form-fields'
import { vehicleFormFieldGroup } from '../../vehicles/lib/vehicle-form-fields'
import { armorFormFieldGroup } from '../../armor/lib/armor-form-fields'
import { weaponFormFieldGroup } from '../../weapons/lib/weapon-form-fields'

/** Per-family form groups registered by kind. */
export const kindFieldGroups: Partial<Record<EquipmentKind, () => FormItem[]>> = {
  service: () => [serviceFormFieldGroup()],
  mount: () => [mountFormFieldGroup()],
  tool: () => [toolFormFieldGroup()],
  magic_item: () => [magicItemFormFieldGroup()],
  adventuring_gear: () => [adventuringGearFormFieldGroup()],
  vehicle: () => [vehicleFormFieldGroup()],
  armor: () => [armorFormFieldGroup()],
  weapon: () => [weaponFormFieldGroup()],
}

/** Returns registered field groups for a kind. */
export function fieldGroupsForEquipmentKind(kind: EquipmentKind): FormItem[] | undefined {
  return kindFieldGroups[kind]?.()
}

/** All registered kind groups for the unscoped (hub) form. */
export function allRegisteredKindFieldGroups(): FormItem[] {
  return (Object.keys(kindFieldGroups) as EquipmentKind[]).flatMap((kind) =>
    kindFieldGroups[kind]!(),
  )
}
