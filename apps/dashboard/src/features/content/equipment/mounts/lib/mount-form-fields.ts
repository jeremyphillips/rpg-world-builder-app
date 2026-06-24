import type { MountEquipment } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import {
  massInputSelectField,
  massToForm,
  MOUNT_CARRYING_CAPACITY_LABEL,
} from '../../../lib/content-form-field-helpers'
import type { EquipmentFormValues } from '../../lib/equipment-form-def'

/** Mount-specific form field group for the unified equipment form. */
export function mountFormFieldGroup(): FormItem {
  return {
    kind: 'group',
    legend: 'Mount',
    fields: [
      massInputSelectField({
        name: 'carryingCapacity',
        label: MOUNT_CARRYING_CAPACITY_LABEL,
        required: true,
        defaultUnit: 'lb',
        valueDigits: 3,
      }),
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
    carryingCapacity: massToForm(item.carryingCapacity),
    speed: item.speed,
  }
}
