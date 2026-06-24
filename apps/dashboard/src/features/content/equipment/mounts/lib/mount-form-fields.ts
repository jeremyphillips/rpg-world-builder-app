import type { MountEquipment } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { massToForm, mountCapacitySpeedFields } from '../../../lib/content-form-field-helpers'
import type { EquipmentFormValues } from '../../lib/equipment-form-def'

/** Mount-specific form field group for the unified equipment form. */
export function mountFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Mount',
    fields: mountCapacitySpeedFields(),
  }
}

export function mountFormValuesFromEntity(
  item: MountEquipment,
): Pick<EquipmentFormValues, 'carryingCapacity' | 'speed'> {
  return {
    carryingCapacity: massToForm(item.carryingCapacity),
    speed: item.speed,
  }
}
