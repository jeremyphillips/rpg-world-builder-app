import type { MountEquipment } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import type { EquipmentFormValues } from '../../lib/equipment-form-def'

/** Mount-specific form field group for the unified equipment form. */
export function mountFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Mount',
    fields: [
      {
        type: 'number',
        name: 'carryingCapacity',
        label: 'Carrying capacity (lb)',
        min: 0,
        required: true,
      },
      {
        type: 'text',
        name: 'speed',
        label: 'Speed',
      },
    ],
  }
}

export function mountFormValuesFromEntity(
  item: MountEquipment,
): Pick<EquipmentFormValues, 'carryingCapacity' | 'speed'> {
  return {
    carryingCapacity: item.carryingCapacity.value,
    speed: item.speed,
  }
}
